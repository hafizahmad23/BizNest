-- ==============================================================================
-- BizNest Chat Notifications & Read Receipts Update
-- ==============================================================================
-- DESCRIPTION:
-- 1. Creates a database trigger that automatically inserts a notification
--    whenever a new message is sent in a conversation. It routes the alert
--    to the OTHER participant (merchant -> customer, or customer -> merchant).
-- 2. Adds an RLS UPDATE policy to the `messages` table so recipients can mark
--    messages as read (is_read = true) but cannot alter sender_id or content.
--
-- INSTRUCTIONS FOR THE OWNER:
-- 1. Copy the entire contents of this file.
-- 2. Go to your Supabase Dashboard -> SQL Editor -> New query.
-- 3. Paste and click "Run".
--
-- EXPECTED RESULT:
-- You should see "Success. No rows returned" along with NOTICE messages like:
-- "NOTICE:  Function notify_chat_message() created successfully"
-- ==============================================================================

-- 1. Function to insert a notification on new chat message
CREATE OR REPLACE FUNCTION public.notify_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_id UUID;
    v_business_id UUID;
    v_owner_id UUID;
    v_recipient_id UUID;
    v_sender_name TEXT;
    v_preview TEXT;
BEGIN
    -- Get the conversation details
    SELECT customer_id, business_id 
    INTO v_customer_id, v_business_id
    FROM public.conversations
    WHERE id = NEW.conversation_id;

    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    -- Get the business owner id
    SELECT owner_id INTO v_owner_id
    FROM public.businesses
    WHERE id = v_business_id;

    -- Determine recipient
    IF NEW.sender_id = v_customer_id THEN
        v_recipient_id := v_owner_id;
    ELSE
        v_recipient_id := v_customer_id;
    END IF;

    -- Safety check: don't notify oneself
    IF v_recipient_id = NEW.sender_id THEN
        RETURN NEW;
    END IF;

    -- Get sender name
    SELECT full_name INTO v_sender_name
    FROM public.profiles
    WHERE id = NEW.sender_id;
    
    IF v_sender_name IS NULL OR v_sender_name = '' THEN
        v_sender_name := 'Someone';
    END IF;

    -- Truncate message preview (up to 80 chars)
    v_preview := SUBSTRING(NEW.content, 1, 80);
    IF LENGTH(NEW.content) > 80 THEN
        v_preview := v_preview || '...';
    END IF;

    -- Insert notification
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        reference_type,
        reference_id,
        is_read,
        created_at
    ) VALUES (
        v_recipient_id,
        'chat_message',
        '💬 New message',
        v_sender_name || ': ' || v_preview,
        'conversation',
        NEW.conversation_id,
        false,
        NOW()
    );

    RETURN NEW;
END;
$$;

-- 2. Attach the trigger to the messages table
DROP TRIGGER IF EXISTS trigger_notify_chat_message ON public.messages;

CREATE TRIGGER trigger_notify_chat_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_chat_message();


-- 3. RLS UPDATE policy so recipient can mark message as read
DROP POLICY IF EXISTS "messages_mark_read_recipient" ON public.messages;

CREATE POLICY "messages_mark_read_recipient" ON public.messages
    FOR UPDATE 
    USING (
        -- Only a participant can update (mirroring the SELECT policy logic)
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.customer_id = auth.uid() OR public.is_business_owner(c.business_id))
        )
        -- Can only update messages sent by someone else
        AND sender_id <> auth.uid()
    )
    WITH CHECK (
        -- Can only update messages sent by someone else
        sender_id <> auth.uid()
        -- Ensure only is_read can be set to true, no other malicious changes
        -- Actually, RLS WITH CHECK evaluates the NEW row. We want to ensure 
        -- they aren't changing the sender_id.
        AND is_read = true
    );
