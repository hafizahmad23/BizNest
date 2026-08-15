export interface CityOrVillageItem {
  id: string;
  name: string;
  type: 'city' | 'town' | 'village' | 'area' | 'sector';
  lat: number;
  lng: number;
  postalCode?: string;
  businessCount?: number;
}

export interface TehsilItem {
  id: string;
  name: string;
  citiesOrVillages: CityOrVillageItem[];
}

export interface DistrictItem {
  id: string;
  name: string;
  tehsils: TehsilItem[];
}

export interface ProvinceItem {
  id: string;
  name: string;
  code: string;
  districts: DistrictItem[];
}

export const PAKISTAN_LOCATION_DB: ProvinceItem[] = [
  {
    id: 'punjab',
    name: 'Punjab',
    code: 'PB',
    districts: [
      {
        id: 'lahore-dist',
        name: 'Lahore',
        tehsils: [
          {
            id: 'lahore-city-tehsil',
            name: 'Lahore City',
            citiesOrVillages: [
              { id: 'gulberg-lhr', name: 'Gulberg (I, II, III)', type: 'area', lat: 31.5204, lng: 74.3587, businessCount: 4200 },
              { id: 'model-town-lhr', name: 'Model Town', type: 'area', lat: 31.4822, lng: 74.3223, businessCount: 1850 },
              { id: 'johar-town-lhr', name: 'Johar Town (Phase 1 & 2)', type: 'area', lat: 31.4697, lng: 74.2728, businessCount: 2900 },
              { id: 'dha-lhr', name: 'DHA Lahore (Phases 1-9)', type: 'area', lat: 31.4705, lng: 74.4101, businessCount: 5100 },
              { id: 'faisal-town-lhr', name: 'Faisal Town', type: 'area', lat: 31.4795, lng: 74.3051, businessCount: 940 },
              { id: 'askari-lhr', name: 'Askari (1-11)', type: 'area', lat: 31.5011, lng: 74.3820, businessCount: 680 },
              { id: 'ichhra-lhr', name: 'Ichhra & Ferozepur Road', type: 'area', lat: 31.5280, lng: 74.3211, businessCount: 1200 },
              { id: 'mall-road-lhr', name: 'Mall Road & Anarkali', type: 'area', lat: 31.5601, lng: 74.3150, businessCount: 1600 }
            ]
          },
          {
            id: 'lahore-cantt-tehsil',
            name: 'Lahore Cantt',
            citiesOrVillages: [
              { id: 'cantt-main-lhr', name: 'Lahore Cantt Main', type: 'area', lat: 31.5300, lng: 74.3750, businessCount: 1100 },
              { id: 'cavalry-ground-lhr', name: 'Cavalry Ground', type: 'area', lat: 31.5050, lng: 74.3680, businessCount: 850 },
              { id: 'bedian-road-lhr', name: 'Bedian Road & Villages', type: 'village', lat: 31.4320, lng: 74.4510, businessCount: 320 }
            ]
          },
          {
            id: 'raiwind-tehsil',
            name: 'Raiwind',
            citiesOrVillages: [
              { id: 'raiwind-city', name: 'Raiwind City', type: 'city', lat: 31.2504, lng: 74.2135, businessCount: 890 },
              { id: 'bahria-town-lhr', name: 'Bahria Town Lahore', type: 'area', lat: 31.3682, lng: 74.1852, businessCount: 2300 },
              { id: 'lake-city-lhr', name: 'Lake City & Adda Plot', type: 'area', lat: 31.3320, lng: 74.2410, businessCount: 650 },
              { id: 'sunda-village', name: 'Sunda Village', type: 'village', lat: 31.2210, lng: 74.1950, businessCount: 110 }
            ]
          },
          {
            id: 'shalimar-tehsil',
            name: 'Shalimar',
            citiesOrVillages: [
              { id: 'mughalpura-lhr', name: 'Mughalpura', type: 'area', lat: 31.5620, lng: 74.3810, businessCount: 780 },
              { id: 'baghbanpura-lhr', name: 'Baghbanpura & Shalimar Link', type: 'area', lat: 31.5810, lng: 74.3820, businessCount: 920 },
              { id: 'harbanspura-lhr', name: 'Harbanspura', type: 'area', lat: 31.5720, lng: 74.4210, businessCount: 450 }
            ]
          },
          {
            id: 'model-town-tehsil',
            name: 'Model Town Tehsil',
            citiesOrVillages: [
              { id: 'kot-lakhpat-lhr', name: 'Kot Lakhpat Industrial Area', type: 'area', lat: 31.4580, lng: 74.3350, businessCount: 1400 },
              { id: 'township-lhr', name: 'Township (Sectors A-D)', type: 'area', lat: 31.4420, lng: 74.3110, businessCount: 1650 },
              { id: 'green-town-lhr', name: 'Green Town', type: 'area', lat: 31.4280, lng: 74.3010, businessCount: 820 }
            ]
          }
        ]
      },
      {
        id: 'rawalpindi-dist',
        name: 'Rawalpindi',
        tehsils: [
          {
            id: 'pindi-city-tehsil',
            name: 'Rawalpindi City',
            citiesOrVillages: [
              { id: 'saddar-pindi', name: 'Saddar Rawalpindi', type: 'area', lat: 33.5951, lng: 73.0569, businessCount: 2200 },
              { id: 'satellite-town-pindi', name: 'Satellite Town & 6th Road', type: 'area', lat: 33.6321, lng: 73.0722, businessCount: 1800 },
              { id: 'commercial-market-pindi', name: 'Commercial Market', type: 'area', lat: 33.6350, lng: 73.0780, businessCount: 1500 },
              { id: 'chaklala-scheme3-pindi', name: 'Chaklala Scheme 3', type: 'area', lat: 33.5820, lng: 73.0910, businessCount: 890 },
              { id: 'bahria-town-pindi', name: 'Bahria Town Rawalpindi (Ph 1-8)', type: 'area', lat: 33.5180, lng: 73.0980, businessCount: 3100 }
            ]
          },
          {
            id: 'gujar-khan-tehsil',
            name: 'Gujar Khan',
            citiesOrVillages: [
              { id: 'gujar-khan-city', name: 'Gujar Khan City', type: 'city', lat: 33.2541, lng: 73.3042, businessCount: 650 },
              { id: 'bewal-town', name: 'Bewal Town', type: 'town', lat: 33.3210, lng: 73.4110, businessCount: 180 },
              { id: 'qazian-village', name: 'Qazian Village', type: 'village', lat: 33.2200, lng: 73.2800, businessCount: 75 }
            ]
          },
          {
            id: 'taxila-tehsil',
            name: 'Taxila',
            citiesOrVillages: [
              { id: 'taxila-city', name: 'Taxila City', type: 'city', lat: 33.7463, lng: 72.8397, businessCount: 820 },
              { id: 'wah-cantt', name: 'Wah Cantt & Lalamukh', type: 'city', lat: 33.7782, lng: 72.7236, businessCount: 1450 }
            ]
          },
          {
            id: 'murree-tehsil',
            name: 'Murree',
            citiesOrVillages: [
              { id: 'murree-mall-road', name: 'Murree Mall Road & GPO', type: 'city', lat: 33.9070, lng: 73.3903, businessCount: 980 },
              { id: 'bhurban', name: 'Bhurban Resort Area', type: 'town', lat: 33.9550, lng: 73.4520, businessCount: 240 },
              { id: 'patriata', name: 'Patriata (New Murree)', type: 'village', lat: 33.8720, lng: 73.4350, businessCount: 120 }
            ]
          },
          {
            id: 'kahuta-tehsil',
            name: 'Kahuta',
            citiesOrVillages: [
              { id: 'kahuta-city', name: 'Kahuta City', type: 'city', lat: 33.5880, lng: 73.3880, businessCount: 420 },
              { id: 'nara-village', name: 'Nara Village', type: 'village', lat: 33.5100, lng: 73.4200, businessCount: 60 }
            ]
          },
          {
            id: 'kallar-syedan-tehsil',
            name: 'Kallar Syedan',
            citiesOrVillages: [
              { id: 'kallar-city', name: 'Kallar Syedan Town', type: 'town', lat: 33.4110, lng: 73.3750, businessCount: 380 },
              { id: 'choha-khalsa', name: 'Choha Khalsa Village', type: 'village', lat: 33.3820, lng: 73.4200, businessCount: 90 }
            ]
          }
        ]
      },
      {
        id: 'faisalabad-dist',
        name: 'Faisalabad',
        tehsils: [
          {
            id: 'fsd-city-tehsil',
            name: 'Faisalabad City',
            citiesOrVillages: [
              { id: 'd-ground-fsd', name: 'D Ground Peoples Colony', type: 'area', lat: 31.4180, lng: 73.1020, businessCount: 1950 },
              { id: 'ghanta-ghar-fsd', name: 'Clock Tower (Ghanta Ghar 8 Bazaars)', type: 'area', lat: 31.4181, lng: 73.0791, businessCount: 2800 },
              { id: 'madina-town-fsd', name: 'Madina Town & Kohinoor', type: 'area', lat: 31.4290, lng: 73.1180, businessCount: 1250 },
              { id: 'canal-road-fsd', name: 'Canal Road Commercial Hub', type: 'area', lat: 31.4420, lng: 73.1310, businessCount: 920 }
            ]
          },
          {
            id: 'jaranwala-tehsil',
            name: 'Jaranwala',
            citiesOrVillages: [
              { id: 'jaranwala-city', name: 'Jaranwala City', type: 'city', lat: 31.3342, lng: 73.4194, businessCount: 780 },
              { id: 'roshi-village', name: 'Chak 235 GB Village', type: 'village', lat: 31.3100, lng: 73.4500, businessCount: 45 }
            ]
          },
          {
            id: 'samundri-tehsil',
            name: 'Samundri',
            citiesOrVillages: [
              { id: 'samundri-city', name: 'Samundri City', type: 'city', lat: 31.0632, lng: 72.9620, businessCount: 520 },
              { id: 'dijkot-town', name: 'Dijkot Town', type: 'town', lat: 31.2180, lng: 72.9950, businessCount: 210 }
            ]
          },
          {
            id: 'tandlianwala-tehsil',
            name: 'Tandlianwala',
            citiesOrVillages: [
              { id: 'tandlianwala-city', name: 'Tandlianwala City', type: 'city', lat: 31.0330, lng: 73.1330, businessCount: 410 },
              { id: 'kanjani-village', name: 'Kanjani Village', type: 'village', lat: 31.0800, lng: 73.2000, businessCount: 50 }
            ]
          },
          {
            id: 'chak-jhumra-tehsil',
            name: 'Chak Jhumra',
            citiesOrVillages: [
              { id: 'chak-jhumra-city', name: 'Chak Jhumra Town', type: 'town', lat: 31.5680, lng: 73.1820, businessCount: 310 }
            ]
          }
        ]
      },
      {
        id: 'multan-dist',
        name: 'Multan',
        tehsils: [
          {
            id: 'multan-city-tehsil',
            name: 'Multan City',
            citiesOrVillages: [
              { id: 'gulgasht-multan', name: 'Gulgasht Colony', type: 'area', lat: 30.2220, lng: 71.4890, businessCount: 1450 },
              { id: 'cantt-multan', name: 'Multan Cantt & Mall Road', type: 'area', lat: 30.1820, lng: 71.4420, businessCount: 1100 },
              { id: 'shah-rukn-e-alam', name: 'Shah Rukn-e-Alam Colony', type: 'area', lat: 30.2010, lng: 71.5020, businessCount: 880 },
              { id: 'bosan-road-multan', name: 'Bosan Road & BZU Area', type: 'area', lat: 30.2580, lng: 71.5120, businessCount: 620 }
            ]
          },
          {
            id: 'shujabad-tehsil',
            name: 'Shujabad',
            citiesOrVillages: [
              { id: 'shujabad-city', name: 'Shujabad City', type: 'city', lat: 29.8803, lng: 71.2951, businessCount: 410 },
              { id: 'raja-ram-village', name: 'Raja Ram Village', type: 'village', lat: 29.8100, lng: 71.3200, businessCount: 60 }
            ]
          },
          {
            id: 'jalalpur-pirwala-tehsil',
            name: 'Jalalpur Pirwala',
            citiesOrVillages: [
              { id: 'jalalpur-city', name: 'Jalalpur Pirwala Town', type: 'town', lat: 29.5050, lng: 71.2210, businessCount: 290 }
            ]
          }
        ]
      },
      {
        id: 'gujranwala-dist',
        name: 'Gujranwala',
        tehsils: [
          {
            id: 'grw-city-tehsil',
            name: 'Gujranwala City',
            citiesOrVillages: [
              { id: 'civil-lines-grw', name: 'Civil Lines & Model Town', type: 'area', lat: 32.1610, lng: 74.1850, businessCount: 1350 },
              { id: 'gt-road-grw', name: 'GT Road Commercial Belt', type: 'area', lat: 32.1877, lng: 74.1945, businessCount: 1900 },
              { id: 'peoples-colony-grw', name: 'Peoples Colony', type: 'area', lat: 32.1480, lng: 74.2010, businessCount: 780 }
            ]
          },
          {
            id: 'kamoke-tehsil',
            name: 'Kamoke',
            citiesOrVillages: [
              { id: 'kamoke-city', name: 'Kamoke Rice Hub', type: 'city', lat: 31.9772, lng: 74.2220, businessCount: 680 },
              { id: 'ghakkhar-mandi', name: 'Ghakhar Mandi', type: 'town', lat: 32.3020, lng: 74.1520, businessCount: 380 }
            ]
          },
          {
            id: 'wazirabad-tehsil',
            name: 'Wazirabad',
            citiesOrVillages: [
              { id: 'wazirabad-city', name: 'Wazirabad Cutlery Hub', type: 'city', lat: 32.4410, lng: 74.1200, businessCount: 920 },
              { id: 'ali-pur-chattha', name: 'Ali Pur Chattha', type: 'town', lat: 32.2610, lng: 73.8180, businessCount: 340 }
            ]
          },
          {
            id: 'nowshera-virkan-tehsil',
            name: 'Nowshera Virkan',
            citiesOrVillages: [
              { id: 'nowshera-virkan-city', name: 'Nowshera Virkan Town', type: 'town', lat: 31.9610, lng: 73.9720, businessCount: 280 }
            ]
          }
        ]
      },
      {
        id: 'sialkot-dist',
        name: 'Sialkot',
        tehsils: [
          {
            id: 'sialkot-city-tehsil',
            name: 'Sialkot City',
            citiesOrVillages: [
              { id: 'paris-road-skt', name: 'Paris Road & Cantt', type: 'area', lat: 32.4945, lng: 74.5229, businessCount: 1200 },
              { id: 'defense-road-skt', name: 'Defense Road Industrial Zone', type: 'area', lat: 32.4780, lng: 74.5410, businessCount: 1100 }
            ]
          },
          {
            id: 'daska-tehsil',
            name: 'Daska',
            citiesOrVillages: [
              { id: 'daska-city', name: 'Daska City', type: 'city', lat: 32.3242, lng: 74.3502, businessCount: 720 },
              { id: 'mitranwali-village', name: 'Mitranwali Village', type: 'village', lat: 32.3800, lng: 74.4200, businessCount: 80 }
            ]
          },
          {
            id: 'pasrur-tehsil',
            name: 'Pasrur',
            citiesOrVillages: [
              { id: 'pasrur-city', name: 'Pasrur City', type: 'city', lat: 32.2680, lng: 74.6620, businessCount: 450 }
            ]
          },
          {
            id: 'sambrial-tehsil',
            name: 'Sambrial',
            citiesOrVillages: [
              { id: 'sambrial-city', name: 'Sambrial Airport Zone', type: 'city', lat: 32.4280, lng: 74.3520, businessCount: 510 }
            ]
          }
        ]
      },
      {
        id: 'attock-dist',
        name: 'Attock',
        tehsils: [
          {
            id: 'attock-city-tehsil',
            name: 'Attock City',
            citiesOrVillages: [
              { id: 'attock-city', name: 'Attock City Center', type: 'city', lat: 33.7660, lng: 72.3609, businessCount: 510 }
            ]
          },
          {
            id: 'hassan-abdal-tehsil',
            name: 'Hassan Abdal',
            citiesOrVillages: [
              { id: 'hassan-abdal-city', name: 'Hassan Abdal City & Panja Sahib', type: 'city', lat: 33.8188, lng: 72.6888, businessCount: 380 }
            ]
          },
          {
            id: 'fateh-jang-tehsil',
            name: 'Fateh Jang',
            citiesOrVillages: [
              { id: 'fateh-jang-city', name: 'Fateh Jang Town', type: 'town', lat: 33.5680, lng: 72.6420, businessCount: 320 }
            ]
          },
          {
            id: 'pindi-gheb-tehsil',
            name: 'Pindi Gheb',
            citiesOrVillages: [
              { id: 'pindi-gheb-city', name: 'Pindi Gheb Town', type: 'town', lat: 33.2420, lng: 72.2680, businessCount: 220 }
            ]
          },
          {
            id: 'jand-tehsil',
            name: 'Jand',
            citiesOrVillages: [
              { id: 'jand-city', name: 'Jand Town', type: 'town', lat: 33.4310, lng: 72.0180, businessCount: 190 }
            ]
          }
        ]
      },
      {
        id: 'sheikhupura-dist',
        name: 'Sheikhupura',
        tehsils: [
          {
            id: 'skp-city-tehsil',
            name: 'Sheikhupura City',
            citiesOrVillages: [
              { id: 'sheikhupura-city', name: 'Sheikhupura City Center', type: 'city', lat: 31.7167, lng: 73.9850, businessCount: 1280 }
            ]
          },
          {
            id: 'ferozewala-tehsil',
            name: 'Ferozewala',
            citiesOrVillages: [
              { id: 'shahdara-ferozewala', name: 'Shahdara & Ferozewala', type: 'area', lat: 31.6210, lng: 74.2980, businessCount: 890 }
            ]
          },
          {
            id: 'muridke-tehsil',
            name: 'Muridke',
            citiesOrVillages: [
              { id: 'muridke-city', name: 'Muridke GT Road', type: 'city', lat: 31.8020, lng: 74.2580, businessCount: 650 }
            ]
          },
          {
            id: 'sharakpur-tehsil',
            name: 'Sharakpur',
            citiesOrVillages: [
              { id: 'sharakpur-city', name: 'Sharakpur Sharif Town', type: 'town', lat: 31.4680, lng: 73.9680, businessCount: 310 }
            ]
          }
        ]
      },
      {
        id: 'gujrat-dist',
        name: 'Gujrat',
        tehsils: [
          {
            id: 'gujrat-city-tehsil',
            name: 'Gujrat City',
            citiesOrVillages: [
              { id: 'gujrat-city', name: 'Gujrat City & Fan Industry Zone', type: 'city', lat: 32.5742, lng: 74.0754, businessCount: 1420 }
            ]
          },
          {
            id: 'kharian-tehsil',
            name: 'Kharian',
            citiesOrVillages: [
              { id: 'kharian-city', name: 'Kharian City & Cantt', type: 'city', lat: 32.8130, lng: 73.8820, businessCount: 880 },
              { id: 'dingah-town', name: 'Dinga Town', type: 'town', lat: 32.6410, lng: 73.7210, businessCount: 340 }
            ]
          },
          {
            id: 'sarai-alamgir-tehsil',
            name: 'Sarai Alamgir',
            citiesOrVillages: [
              { id: 'sarai-alamgir-city', name: 'Sarai Alamgir Town', type: 'town', lat: 32.9020, lng: 73.7550, businessCount: 420 }
            ]
          }
        ]
      },
      {
        id: 'sahiwal-dist',
        name: 'Sahiwal',
        tehsils: [
          {
            id: 'sahiwal-city-tehsil',
            name: 'Sahiwal City',
            citiesOrVillages: [
              { id: 'sahiwal-city', name: 'Sahiwal City Center', type: 'city', lat: 30.6682, lng: 73.1114, businessCount: 1100 }
            ]
          },
          {
            id: 'chichawatni-tehsil',
            name: 'Chichawatni',
            citiesOrVillages: [
              { id: 'chichawatni-city', name: 'Chichawatni Junction', type: 'city', lat: 30.5330, lng: 72.7000, businessCount: 520 }
            ]
          }
        ]
      },
      {
        id: 'sargodha-dist',
        name: 'Sargodha',
        tehsils: [
          {
            id: 'sargodha-city-tehsil',
            name: 'Sargodha City',
            citiesOrVillages: [
              { id: 'sargodha-city', name: 'Sargodha Citrus City', type: 'city', lat: 32.0836, lng: 72.6711, businessCount: 1650 }
            ]
          },
          {
            id: 'bhalwal-tehsil',
            name: 'Bhalwal',
            citiesOrVillages: [
              { id: 'bhalwal-city', name: 'Bhalwal Town', type: 'town', lat: 32.2680, lng: 72.8980, businessCount: 410 }
            ]
          },
          {
            id: 'silanwali-tehsil',
            name: 'Silanwali',
            citiesOrVillages: [
              { id: 'silanwali-town', name: 'Silanwali Handicraft Town', type: 'town', lat: 31.8280, lng: 72.5380, businessCount: 280 }
            ]
          }
        ]
      },
      {
        id: 'bahawalpur-dist',
        name: 'Bahawalpur',
        tehsils: [
          {
            id: 'bwp-city-tehsil',
            name: 'Bahawalpur City',
            citiesOrVillages: [
              { id: 'bahawalpur-city', name: 'Bahawalpur Royal City', type: 'city', lat: 29.3956, lng: 71.6836, businessCount: 1350 }
            ]
          },
          {
            id: 'ahmedpur-east-tehsil',
            name: 'Ahmedpur East',
            citiesOrVillages: [
              { id: 'ahmedpur-city', name: 'Ahmedpur East City', type: 'city', lat: 29.1431, lng: 71.2589, businessCount: 480 },
              { id: 'uch-sharif', name: 'Uch Sharif Historical Shrine Town', type: 'town', lat: 29.2380, lng: 71.0620, businessCount: 210 }
            ]
          },
          {
            id: 'yazman-tehsil',
            name: 'Yazman / Cholistan',
            citiesOrVillages: [
              { id: 'yazman-town', name: 'Yazman Gateway to Cholistan', type: 'town', lat: 29.1410, lng: 71.7480, businessCount: 220 },
              { id: 'derawar-fort-village', name: 'Derawar Fort Village', type: 'village', lat: 28.7680, lng: 71.3320, businessCount: 45 }
            ]
          }
        ]
      },
      {
        id: 'rahim-yar-khan-dist',
        name: 'Rahim Yar Khan',
        tehsils: [
          {
            id: 'ryk-city-tehsil',
            name: 'Rahim Yar Khan City',
            citiesOrVillages: [
              { id: 'ryk-city', name: 'Rahim Yar Khan City Center', type: 'city', lat: 28.4212, lng: 70.2989, businessCount: 1480 }
            ]
          },
          {
            id: 'sadiqabad-tehsil',
            name: 'Sadiqabad',
            citiesOrVillages: [
              { id: 'sadiqabad-city', name: 'Sadiqabad Industrial City', type: 'city', lat: 28.3080, lng: 70.1310, businessCount: 920 }
            ]
          },
          {
            id: 'khanpur-tehsil',
            name: 'Khanpur',
            citiesOrVillages: [
              { id: 'khanpur-city', name: 'Khanpur Katora City', type: 'city', lat: 28.6480, lng: 70.6580, businessCount: 520 }
            ]
          }
        ]
      },
      {
        id: 'dg-khan-dist',
        name: 'Dera Ghazi Khan',
        tehsils: [
          {
            id: 'dgk-city-tehsil',
            name: 'Dera Ghazi Khan City',
            citiesOrVillages: [
              { id: 'dgk-city', name: 'D.G. Khan City', type: 'city', lat: 30.0561, lng: 70.6348, businessCount: 980 }
            ]
          },
          {
            id: 'taunsa-tehsil',
            name: 'Taunsa Sharif',
            citiesOrVillages: [
              { id: 'taunsa-city', name: 'Taunsa Sharif Town', type: 'town', lat: 30.7020, lng: 70.6510, businessCount: 410 },
              { id: 'fort-munro-village', name: 'Fort Munro Hill Station', type: 'village', lat: 29.9280, lng: 69.9820, businessCount: 95 }
            ]
          }
        ]
      },
      {
        id: 'jhelum-dist',
        name: 'Jhelum',
        tehsils: [
          {
            id: 'jhelum-city-tehsil',
            name: 'Jhelum City',
            citiesOrVillages: [
              { id: 'jhelum-city', name: 'Jhelum Cantt & Main Bazaar', type: 'city', lat: 32.9328, lng: 73.7264, businessCount: 890 }
            ]
          },
          {
            id: 'pind-dadan-khan-tehsil',
            name: 'Pind Dadan Khan',
            citiesOrVillages: [
              { id: 'pind-dadan-khan', name: 'Pind Dadan Khan & Khewra Salt Mine', type: 'city', lat: 32.5830, lng: 73.0420, businessCount: 380 }
            ]
          },
          {
            id: 'sohawa-tehsil',
            name: 'Sohawa',
            citiesOrVillages: [
              { id: 'sohawa-town', name: 'Sohawa Town', type: 'town', lat: 33.1210, lng: 73.4210, businessCount: 210 }
            ]
          }
        ]
      },
      {
        id: 'chakwal-dist',
        name: 'Chakwal',
        tehsils: [
          {
            id: 'chakwal-city-tehsil',
            name: 'Chakwal City',
            citiesOrVillages: [
              { id: 'chakwal-city', name: 'Chakwal City Center', type: 'city', lat: 32.9328, lng: 72.8520, businessCount: 780 }
            ]
          },
          {
            id: 'choa-saidan-shah-tehsil',
            name: 'Choa Saidan Shah',
            citiesOrVillages: [
              { id: 'choa-saidan-shah', name: 'Choa Saidan Shah & Katas Raj', type: 'town', lat: 32.7210, lng: 72.9820, businessCount: 220 }
            ]
          },
          {
            id: 'talagang-tehsil',
            name: 'Talagang',
            citiesOrVillages: [
              { id: 'talagang-city', name: 'Talagang City', type: 'city', lat: 32.9280, lng: 72.4180, businessCount: 510 }
            ]
          }
        ]
      },
      {
        id: 'kasur-dist',
        name: 'Kasur',
        tehsils: [
          {
            id: 'kasur-city-tehsil',
            name: 'Kasur City',
            citiesOrVillages: [
              { id: 'kasur-city', name: 'Kasur Bulleh Shah City', type: 'city', lat: 31.1156, lng: 74.4468, businessCount: 1100 }
            ]
          },
          {
            id: 'pattoki-tehsil',
            name: 'Pattoki',
            citiesOrVillages: [
              { id: 'pattoki-city', name: 'Pattoki Flower & Nursery Hub', type: 'city', lat: 31.0210, lng: 73.8520, businessCount: 780 }
            ]
          },
          {
            id: 'chunian-tehsil',
            name: 'Chunian',
            citiesOrVillages: [
              { id: 'chunian-city', name: 'Chunian Historic Town', type: 'city', lat: 30.9680, lng: 73.9810, businessCount: 390 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sindh',
    name: 'Sindh',
    code: 'SD',
    districts: [
      {
        id: 'karachi-south-dist',
        name: 'Karachi South',
        tehsils: [
          {
            id: 'saddar-karachi-tehsil',
            name: 'Saddar Tehsil',
            citiesOrVillages: [
              { id: 'clifton-khi', name: 'Clifton (Blocks 1-9)', type: 'area', lat: 24.8271, lng: 67.0322, businessCount: 3800 },
              { id: 'dha-khi', name: 'DHA Karachi (Phases 1-8)', type: 'area', lat: 24.8080, lng: 67.0620, businessCount: 4900 },
              { id: 'saddar-bazaar-khi', name: 'Saddar Bazaar & Empress Market', type: 'area', lat: 24.8580, lng: 67.0250, businessCount: 3100 },
              { id: 'i-i-chundrigar-khi', name: 'I.I. Chundrigar Road Financial Hub', type: 'area', lat: 24.8502, lng: 67.0011, businessCount: 2200 }
            ]
          },
          {
            id: 'lyari-tehsil',
            name: 'Lyari',
            citiesOrVillages: [
              { id: 'lyari-main', name: 'Lyari & Khada Market', type: 'area', lat: 24.8680, lng: 66.9920, businessCount: 1200 }
            ]
          },
          {
            id: 'garden-tehsil',
            name: 'Garden',
            citiesOrVillages: [
              { id: 'garden-east-west', name: 'Garden East & West', type: 'area', lat: 24.8780, lng: 67.0210, businessCount: 1400 }
            ]
          }
        ]
      },
      {
        id: 'karachi-east-dist',
        name: 'Karachi East',
        tehsils: [
          {
            id: 'gulshan-iqbal-tehsil',
            name: 'Gulshan-e-Iqbal',
            citiesOrVillages: [
              { id: 'gulshan-khi', name: 'Gulshan-e-Iqbal (Blocks 1-20)', type: 'area', lat: 24.9200, lng: 67.0900, businessCount: 3200 },
              { id: 'gulistan-johar-khi', name: 'Gulistan-e-Johar (Blocks 1-20)', type: 'area', lat: 24.9120, lng: 67.1320, businessCount: 2800 },
              { id: 'pechs-khi', name: 'PECHS & Tariq Road', type: 'area', lat: 24.8720, lng: 67.0610, businessCount: 2900 },
              { id: 'bahadurabad-khi', name: 'Bahadurabad Food & Fashion Hub', type: 'area', lat: 24.8820, lng: 67.0690, businessCount: 1650 }
            ]
          },
          {
            id: 'jamshed-town-tehsil',
            name: 'Jamshed Quarters',
            citiesOrVillages: [
              { id: 'lines-area-khi', name: 'Lines Area & Soldier Bazaar', type: 'area', lat: 24.8680, lng: 67.0380, businessCount: 1100 }
            ]
          }
        ]
      },
      {
        id: 'karachi-central-dist',
        name: 'Karachi Central',
        tehsils: [
          {
            id: 'north-nazimabad-tehsil',
            name: 'North Nazimabad',
            citiesOrVillages: [
              { id: 'north-nazimabad-khi', name: 'North Nazimabad (Blocks A-N)', type: 'area', lat: 24.9380, lng: 67.0390, businessCount: 2100 },
              { id: 'federal-b-area-khi', name: 'Federal B Area (Blocks 1-22)', type: 'area', lat: 24.9310, lng: 67.0710, businessCount: 1850 }
            ]
          },
          {
            id: 'gulberg-karachi-tehsil',
            name: 'Gulberg Karachi',
            citiesOrVillages: [
              { id: 'water-pump-khi', name: 'Water Pump & Aisha Manzil', type: 'area', lat: 24.9280, lng: 67.0620, businessCount: 1450 }
            ]
          },
          {
            id: 'liaquatabad-tehsil',
            name: 'Liaquatabad',
            citiesOrVillages: [
              { id: 'liaquatabad-khi', name: 'Liaquatabad & Super Market', type: 'area', lat: 24.9080, lng: 67.0380, businessCount: 1900 }
            ]
          }
        ]
      },
      {
        id: 'karachi-west-dist',
        name: 'Karachi West',
        tehsils: [
          {
            id: 'orangi-tehsil',
            name: 'Orangi Town',
            citiesOrVillages: [
              { id: 'orangi-town-khi', name: 'Orangi Town & Sector 5', type: 'area', lat: 24.9500, lng: 66.9800, businessCount: 1200 }
            ]
          },
          {
            id: 'site-town-tehsil',
            name: 'SITE Industrial Area',
            citiesOrVillages: [
              { id: 'site-khi', name: 'S.I.T.E Industrial Area', type: 'area', lat: 24.8980, lng: 67.0010, businessCount: 2800 }
            ]
          }
        ]
      },
      {
        id: 'korangi-dist',
        name: 'Korangi Karachi',
        tehsils: [
          {
            id: 'korangi-industrial-tehsil',
            name: 'Korangi Industrial',
            citiesOrVillages: [
              { id: 'korangi-ind-area', name: 'Korangi Industrial Area & Creek', type: 'area', lat: 24.8320, lng: 67.1180, businessCount: 3100 },
              { id: 'landhi-khi', name: 'Landhi Export Processing Zone', type: 'area', lat: 24.8480, lng: 67.1820, businessCount: 1800 }
            ]
          },
          {
            id: 'shah-faisal-tehsil',
            name: 'Shah Faisal Colony',
            citiesOrVillages: [
              { id: 'shah-faisal-khi', name: 'Shah Faisal Colony & Drigh Road', type: 'area', lat: 24.8820, lng: 67.1420, businessCount: 1250 }
            ]
          }
        ]
      },
      {
        id: 'malir-dist',
        name: 'Malir Karachi',
        tehsils: [
          {
            id: 'malir-cantt-tehsil',
            name: 'Malir Cantt',
            citiesOrVillages: [
              { id: 'malir-cantt-main', name: 'Malir Cantt & Askari V', type: 'area', lat: 24.9380, lng: 67.1820, businessCount: 1450 },
              { id: 'schem33-khi', name: 'Scheme 33 & Saadi Town', type: 'area', lat: 24.9580, lng: 67.1420, businessCount: 2200 }
            ]
          },
          {
            id: 'bin-qasim-tehsil',
            name: 'Bin Qasim Port',
            citiesOrVillages: [
              { id: 'steel-town-khi', name: 'Steel Town & Port Qasim Area', type: 'area', lat: 24.8210, lng: 67.3180, businessCount: 980 }
            ]
          }
        ]
      },
      {
        id: 'hyderabad-dist',
        name: 'Hyderabad',
        tehsils: [
          {
            id: 'qasimabad-tehsil',
            name: 'Qasimabad',
            citiesOrVillages: [
              { id: 'qasimabad-hyd', name: 'Qasimabad Main & Waddhu Wah', type: 'area', lat: 25.4020, lng: 68.3410, businessCount: 1450 }
            ]
          },
          {
            id: 'latifabad-tehsil',
            name: 'Latifabad',
            citiesOrVillages: [
              { id: 'latifabad-hyd', name: 'Latifabad (Units 1-12)', type: 'area', lat: 25.3620, lng: 68.3710, businessCount: 1900 }
            ]
          },
          {
            id: 'hyd-city-tehsil',
            name: 'Hyderabad City',
            citiesOrVillages: [
              { id: 'resham-gali-hyd', name: 'Resham Gali & Shahi Bazaar', type: 'area', lat: 25.3920, lng: 68.3710, businessCount: 1600 }
            ]
          }
        ]
      },
      {
        id: 'sukkur-dist',
        name: 'Sukkur',
        tehsils: [
          {
            id: 'sukkur-city-tehsil',
            name: 'Sukkur City',
            citiesOrVillages: [
              { id: 'sukkur-city', name: 'Sukkur City & Barrage Area', type: 'city', lat: 27.7052, lng: 68.8574, businessCount: 980 }
            ]
          },
          {
            id: 'rohri-tehsil',
            name: 'Rohri',
            citiesOrVillages: [
              { id: 'rohri-city', name: 'Rohri Historic Town', type: 'city', lat: 27.6890, lng: 68.8950, businessCount: 420 }
            ]
          },
          {
            id: 'pano-akil-tehsil',
            name: 'Pano Akil',
            citiesOrVillages: [
              { id: 'pano-akil-cantt', name: 'Pano Akil Town & Cantt', type: 'city', lat: 27.8520, lng: 68.8520, businessCount: 380 }
            ]
          }
        ]
      },
      {
        id: 'larkana-dist',
        name: 'Larkana',
        tehsils: [
          {
            id: 'larkana-city-tehsil',
            name: 'Larkana City',
            citiesOrVillages: [
              { id: 'larkana-city', name: 'Larkana City Center', type: 'city', lat: 27.5580, lng: 68.2120, businessCount: 1100 }
            ]
          },
          {
            id: 'ratodero-tehsil',
            name: 'Ratodero',
            citiesOrVillages: [
              { id: 'ratodero-town', name: 'Ratodero Town', type: 'town', lat: 27.8020, lng: 68.2880, businessCount: 290 }
            ]
          }
        ]
      },
      {
        id: 'nawabshah-dist',
        name: 'Shaheed Benazirabad (Nawabshah)',
        tehsils: [
          {
            id: 'nawabshah-tehsil',
            name: 'Nawabshah City',
            citiesOrVillages: [
              { id: 'nawabshah-city', name: 'Nawabshah City Center', type: 'city', lat: 26.2442, lng: 68.4100, businessCount: 920 }
            ]
          }
        ]
      },
      {
        id: 'mirpurkhas-dist',
        name: 'Mirpurkhas',
        tehsils: [
          {
            id: 'mirpurkhas-tehsil',
            name: 'Mirpurkhas City',
            citiesOrVillages: [
              { id: 'mirpurkhas-city', name: 'Mirpurkhas Mango City', type: 'city', lat: 25.5269, lng: 69.0111, businessCount: 810 }
            ]
          }
        ]
      },
      {
        id: 'thatta-dist',
        name: 'Thatta',
        tehsils: [
          {
            id: 'thatta-tehsil',
            name: 'Thatta Historic City',
            citiesOrVillages: [
              { id: 'thatta-city', name: 'Thatta & Makli Necropolis', type: 'city', lat: 24.7461, lng: 67.9242, businessCount: 450 },
              { id: 'kenjhar-lake-village', name: 'Kenjhar Lake Resort Area', type: 'village', lat: 24.9380, lng: 68.0510, businessCount: 120 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'kpk',
    name: 'Khyber Pakhtunkhwa',
    code: 'KP',
    districts: [
      {
        id: 'peshawar-dist',
        name: 'Peshawar',
        tehsils: [
          {
            id: 'peshawar-city-tehsil',
            name: 'Peshawar City',
            citiesOrVillages: [
              { id: 'hayatabad-pwr', name: 'Hayatabad (Phases 1-7)', type: 'area', lat: 33.9820, lng: 71.4310, businessCount: 1800 },
              { id: 'university-town-pwr', name: 'University Town', type: 'area', lat: 33.9980, lng: 71.4820, businessCount: 1250 },
              { id: 'saddar-pwr', name: 'Peshawar Saddar & Mall Road', type: 'area', lat: 34.0080, lng: 71.5390, businessCount: 1950 },
              { id: 'qissa-khwani', name: 'Qissa Khwani Bazaar', type: 'area', lat: 34.0120, lng: 71.5680, businessCount: 1100 }
            ]
          }
        ]
      },
      {
        id: 'swat-dist',
        name: 'Swat',
        tehsils: [
          {
            id: 'babuzai-tehsil',
            name: 'Babuzai (Mingora)',
            citiesOrVillages: [
              { id: 'mingora-city', name: 'Mingora City Center', type: 'city', lat: 34.7717, lng: 72.3602, businessCount: 1120 },
              { id: 'saidu-sharif', name: 'Saidu Sharif', type: 'city', lat: 34.7500, lng: 72.3550, businessCount: 540 }
            ]
          },
          {
            id: 'bahrain-tehsil',
            name: 'Bahrain / Kalam',
            citiesOrVillages: [
              { id: 'kalam-valley', name: 'Kalam Valley Town', type: 'town', lat: 35.4800, lng: 72.5800, businessCount: 310 },
              { id: 'bahrain-town', name: 'Bahrain Riverside Town', type: 'town', lat: 35.2050, lng: 72.5480, businessCount: 220 },
              { id: 'madyan-town', name: 'Madyan Trout Valley', type: 'town', lat: 35.1320, lng: 72.5320, businessCount: 180 }
            ]
          },
          {
            id: 'matta-tehsil',
            name: 'Matta',
            citiesOrVillages: [
              { id: 'matta-town', name: 'Matta Bazaar', type: 'town', lat: 34.9310, lng: 72.4180, businessCount: 280 }
            ]
          }
        ]
      },
      {
        id: 'abbottabad-dist',
        name: 'Abbottabad',
        tehsils: [
          {
            id: 'abbottabad-tehsil',
            name: 'Abbottabad Tehsil',
            citiesOrVillages: [
              { id: 'abbottabad-city', name: 'Abbottabad Cantt & Mansehra Road', type: 'city', lat: 34.1688, lng: 73.2215, businessCount: 1200 },
              { id: 'nathiagali', name: 'Nathiagali Hill Station', type: 'town', lat: 34.0720, lng: 73.3850, businessCount: 280 },
              { id: 'havelian-town', name: 'Havelian Junction', type: 'town', lat: 34.0520, lng: 73.1580, businessCount: 390 }
            ]
          }
        ]
      },
      {
        id: 'mansehra-dist',
        name: 'Mansehra',
        tehsils: [
          {
            id: 'mansehra-city-tehsil',
            name: 'Mansehra City',
            citiesOrVillages: [
              { id: 'mansehra-city', name: 'Mansehra City Center', type: 'city', lat: 34.3302, lng: 73.1968, businessCount: 890 }
            ]
          },
          {
            id: 'balakot-tehsil',
            name: 'Balakot / Kaghan Valley',
            citiesOrVillages: [
              { id: 'naran-valley', name: 'Naran Town & Saiful Muluk', type: 'town', lat: 34.9080, lng: 73.6510, businessCount: 420 },
              { id: 'balakot-town', name: 'Balakot Gateway Town', type: 'town', lat: 34.5490, lng: 73.3530, businessCount: 310 },
              { id: 'kaghan-town', name: 'Kaghan Village', type: 'village', lat: 34.7810, lng: 73.5280, businessCount: 110 }
            ]
          }
        ]
      },
      {
        id: 'mardan-dist',
        name: 'Mardan',
        tehsils: [
          {
            id: 'mardan-city-tehsil',
            name: 'Mardan City',
            citiesOrVillages: [
              { id: 'mardan-city', name: 'Mardan Cantt & Bank Road', type: 'city', lat: 34.1983, lng: 72.0406, businessCount: 1320 },
              { id: 'takht-bahi', name: 'Takht-i-Bahi Buddhist Ruins Town', type: 'town', lat: 34.2880, lng: 71.9280, businessCount: 340 }
            ]
          }
        ]
      },
      {
        id: 'swabi-dist',
        name: 'Swabi',
        tehsils: [
          {
            id: 'swabi-city-tehsil',
            name: 'Swabi City',
            citiesOrVillages: [
              { id: 'swabi-city', name: 'Swabi City', type: 'city', lat: 34.1202, lng: 72.4700, businessCount: 780 },
              { id: 'topi-giki', name: 'Topi & GIKI Campus Town', type: 'town', lat: 34.0720, lng: 72.6220, businessCount: 410 }
            ]
          }
        ]
      },
      {
        id: 'kohat-dist',
        name: 'Kohat',
        tehsils: [
          {
            id: 'kohat-city-tehsil',
            name: 'Kohat City',
            citiesOrVillages: [
              { id: 'kohat-city', name: 'Kohat Cantt & KUST Area', type: 'city', lat: 33.5820, lng: 71.4420, businessCount: 820 }
            ]
          }
        ]
      },
      {
        id: 'di-khan-dist',
        name: 'Dera Ismail Khan',
        tehsils: [
          {
            id: 'dik-city-tehsil',
            name: 'D.I. Khan City',
            citiesOrVillages: [
              { id: 'dik-city', name: 'Dera Ismail Khan City', type: 'city', lat: 31.8312, lng: 70.9017, businessCount: 750 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'balochistan',
    name: 'Balochistan',
    code: 'BA',
    districts: [
      {
        id: 'quetta-dist',
        name: 'Quetta',
        tehsils: [
          {
            id: 'quetta-city-tehsil',
            name: 'Quetta City',
            citiesOrVillages: [
              { id: 'quetta-cantt', name: 'Quetta Cantt & Shahrah-e-Iqbal', type: 'area', lat: 30.1798, lng: 66.9750, businessCount: 950 },
              { id: 'satellite-town-quetta', name: 'Satellite Town Quetta', type: 'area', lat: 30.1550, lng: 66.9920, businessCount: 480 },
              { id: 'sariab-road-quetta', name: 'Sariab Road & UOB Area', type: 'area', lat: 30.1380, lng: 66.9820, businessCount: 390 }
            ]
          }
        ]
      },
      {
        id: 'gwadar-dist',
        name: 'Gwadar',
        tehsils: [
          {
            id: 'gwadar-tehsil',
            name: 'Gwadar City',
            citiesOrVillages: [
              { id: 'gwadar-port-city', name: 'Gwadar Port & New Town', type: 'city', lat: 25.1264, lng: 62.3225, businessCount: 380 },
              { id: 'ormara-coastal', name: 'Ormara Coastal Town', type: 'town', lat: 25.2088, lng: 64.6360, businessCount: 110 },
              { id: 'pasni-coastal', name: 'Pasni Fishing Port Town', type: 'town', lat: 25.2630, lng: 63.4710, businessCount: 130 }
            ]
          }
        ]
      },
      {
        id: 'hub-dist',
        name: 'Hub',
        tehsils: [
          {
            id: 'hub-tehsil',
            name: 'Hub Industrial',
            citiesOrVillages: [
              { id: 'hub-chowki', name: 'Hub Chowki & Industrial Zone', type: 'city', lat: 24.9390, lng: 66.8850, businessCount: 620 },
              { id: 'gadani-beach', name: 'Gadani Shipbreaking & Beach', type: 'town', lat: 25.1180, lng: 66.7280, businessCount: 140 }
            ]
          }
        ]
      },
      {
        id: 'khuzdar-dist',
        name: 'Khuzdar',
        tehsils: [
          {
            id: 'khuzdar-tehsil',
            name: 'Khuzdar City',
            citiesOrVillages: [
              { id: 'khuzdar-city', name: 'Khuzdar City & BUITEMS Campus', type: 'city', lat: 27.8110, lng: 66.6080, businessCount: 410 }
            ]
          }
        ]
      },
      {
        id: 'turbat-dist',
        name: 'Turbat (Kech)',
        tehsils: [
          {
            id: 'turbat-tehsil',
            name: 'Turbat City',
            citiesOrVillages: [
              { id: 'turbat-city', name: 'Turbat City Oasis', type: 'city', lat: 26.0010, lng: 63.0500, businessCount: 320 }
            ]
          }
        ]
      },
      {
        id: 'ziarat-dist',
        name: 'Ziarat',
        tehsils: [
          {
            id: 'ziarat-tehsil',
            name: 'Ziarat Valley',
            citiesOrVillages: [
              { id: 'ziarat-residency', name: 'Ziarat Juniper Valley & Residency', type: 'town', lat: 30.3810, lng: 67.7280, businessCount: 180 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ict',
    name: 'Islamabad Capital Territory',
    code: 'ICT',
    districts: [
      {
        id: 'islamabad-dist',
        name: 'Islamabad',
        tehsils: [
          {
            id: 'isb-urban-tehsil',
            name: 'Islamabad Urban Sectors',
            citiesOrVillages: [
              { id: 'blue-area-isb', name: 'Blue Area (Jinnah Ave Commercial)', type: 'area', lat: 33.7088, lng: 73.0580, businessCount: 2900 },
              { id: 'f7-f8-isb', name: 'F-6 / F-7 / F-8 Sectors', type: 'sector', lat: 33.7210, lng: 73.0610, businessCount: 2100 },
              { id: 'f10-f11-isb', name: 'F-10 / F-11 Markaz', type: 'sector', lat: 33.6930, lng: 72.9980, businessCount: 1850 },
              { id: 'i8-i9-isb', name: 'I-8 / I-9 Markaz & Industrial', type: 'sector', lat: 33.6680, lng: 73.0750, businessCount: 1600 },
              { id: 'g9-g11-isb', name: 'G-9 / G-11 Markaz', type: 'sector', lat: 33.6820, lng: 73.0210, businessCount: 1400 },
              { id: 'bahria-isb', name: 'Bahria Town Islamabad (Phases 1-8)', type: 'area', lat: 33.5350, lng: 73.1180, businessCount: 2400 },
              { id: 'dha-isb', name: 'DHA Islamabad (Phases 1-6)', type: 'area', lat: 33.5220, lng: 73.1550, businessCount: 1900 },
              { id: 'gulberg-greens-isb', name: 'Gulberg Greens & Expressway', type: 'area', lat: 33.6120, lng: 73.1420, businessCount: 850 },
              { id: 'e11-isb', name: 'E-11 / MPCHS Sectors', type: 'sector', lat: 33.7050, lng: 72.9780, businessCount: 920 }
            ]
          },
          {
            id: 'isb-rural-tehsil',
            name: 'Islamabad Rural',
            citiesOrVillages: [
              { id: 'bhara-kahu-isb', name: 'Bhara Kahu Town', type: 'town', lat: 33.7420, lng: 73.1810, businessCount: 720 },
              { id: 'tarlai-village', name: 'Tarlai Kalan Village', type: 'village', lat: 33.6350, lng: 73.1310, businessCount: 180 },
              { id: 'rawat-isb', name: 'Rawat Industrial Zone', type: 'town', lat: 33.4980, lng: 73.1920, businessCount: 450 },
              { id: 'shah-allah-ditta', name: 'Shah Allah Ditta Caves Village', type: 'village', lat: 33.7180, lng: 72.9180, businessCount: 85 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'gilgit-baltistan',
    name: 'Gilgit-Baltistan',
    code: 'GB',
    districts: [
      {
        id: 'gilgit-dist',
        name: 'Gilgit',
        tehsils: [
          {
            id: 'gilgit-tehsil',
            name: 'Gilgit City',
            citiesOrVillages: [
              { id: 'gilgit-bazaar', name: 'Gilgit Naya Bazaar & Jutial', type: 'city', lat: 35.9208, lng: 74.3144, businessCount: 680 },
              { id: 'danyore-town', name: 'Danyore Town', type: 'town', lat: 35.9280, lng: 74.3780, businessCount: 220 }
            ]
          }
        ]
      },
      {
        id: 'hunza-dist',
        name: 'Hunza',
        tehsils: [
          {
            id: 'aliabad-tehsil',
            name: 'Aliabad / Karimabad',
            citiesOrVillages: [
              { id: 'karimabad-hunza', name: 'Karimabad Historic Fort Town', type: 'town', lat: 36.3262, lng: 74.6644, businessCount: 320 },
              { id: 'attabad-lake', name: 'Attabad Lake & Gulmit', type: 'village', lat: 36.3380, lng: 74.8620, businessCount: 150 },
              { id: 'passu-cones', name: 'Passu Village & Cones', type: 'village', lat: 36.4710, lng: 74.8820, businessCount: 95 }
            ]
          }
        ]
      },
      {
        id: 'skardu-dist',
        name: 'Skardu',
        tehsils: [
          {
            id: 'skardu-tehsil',
            name: 'Skardu Town',
            citiesOrVillages: [
              { id: 'skardu-city', name: 'Skardu Bazaar & Shangrila', type: 'city', lat: 35.2971, lng: 75.6333, businessCount: 410 },
              { id: 'shigar-valley', name: 'Shigar Fort Valley', type: 'town', lat: 35.4210, lng: 75.7310, businessCount: 140 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ajk',
    name: 'Azad Jammu & Kashmir',
    code: 'AJK',
    districts: [
      {
        id: 'muzaffarabad-dist',
        name: 'Muzaffarabad',
        tehsils: [
          {
            id: 'muzaffarabad-tehsil',
            name: 'Muzaffarabad City',
            citiesOrVillages: [
              { id: 'muzaffarabad-city', name: 'Muzaffarabad Capital City Center', type: 'city', lat: 34.3700, lng: 73.4711, businessCount: 880 }
            ]
          },
          {
            id: 'neelum-valley-tehsil',
            name: 'Neelum Valley Gateway',
            citiesOrVillages: [
              { id: 'kutton-neelum', name: 'Kutton & Keran Valley', type: 'town', lat: 34.6210, lng: 73.8820, businessCount: 210 },
              { id: 'sharda-neelum', name: 'Sharda Ruins Town', type: 'town', lat: 34.7920, lng: 74.1820, businessCount: 140 }
            ]
          }
        ]
      },
      {
        id: 'mirpur-dist',
        name: 'Mirpur AJK',
        tehsils: [
          {
            id: 'mirpur-tehsil',
            name: 'Mirpur City',
            citiesOrVillages: [
              { id: 'mirpur-city', name: 'Mirpur Sector F/1 & Main Bazaar', type: 'city', lat: 33.1481, lng: 73.7519, businessCount: 750 },
              { id: 'dadyal-town', name: 'Dadyal Town', type: 'town', lat: 33.3280, lng: 73.7210, businessCount: 380 }
            ]
          }
        ]
      },
      {
        id: 'rawalakot-dist',
        name: 'Rawalakot (Poonch)',
        tehsils: [
          {
            id: 'rawalakot-tehsil',
            name: 'Rawalakot City',
            citiesOrVillages: [
              { id: 'rawalakot-city', name: 'Rawalakot City & Banjosa Lake', type: 'city', lat: 33.8583, lng: 73.7653, businessCount: 620 }
            ]
          }
        ]
      }
    ]
  }
];

// Helper utilities for Cascading Selector
export function getAllProvinces() {
  return PAKISTAN_LOCATION_DB.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
    districtCount: p.districts.length
  }));
}

export function getDistrictsByProvince(provinceId: string) {
  if (!provinceId || provinceId === 'all') return [];
  const prov = PAKISTAN_LOCATION_DB.find(p => p.id === provinceId || p.name.toLowerCase() === provinceId.toLowerCase());
  return prov ? prov.districts : [];
}

export function getTehsilsByDistrict(provinceId: string, districtId: string) {
  const districts = getDistrictsByProvince(provinceId);
  const dist = districts.find(d => d.id === districtId || d.name.toLowerCase() === districtId.toLowerCase());
  return dist ? dist.tehsils : [];
}

export function getCitiesOrVillagesByTehsil(provinceId: string, districtId: string, tehsilId: string) {
  const tehsils = getTehsilsByDistrict(provinceId, districtId);
  const teh = tehsils.find(t => t.id === tehsilId || t.name.toLowerCase() === tehsilId.toLowerCase());
  return teh ? teh.citiesOrVillages : [];
}

// Flat search helper across whole location tree
export interface FlatLocationResult {
  provinceName: string;
  districtName: string;
  tehsilName: string;
  cityName: string;
  type: string;
  lat: number;
  lng: number;
  displayText: string;
}

export function searchAllPakistanLocations(query: string, maxResults = 12): FlatLocationResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: FlatLocationResult[] = [];

  for (const prov of PAKISTAN_LOCATION_DB) {
    for (const dist of prov.districts) {
      for (const teh of dist.tehsils) {
        for (const item of teh.citiesOrVillages) {
          if (
            item.name.toLowerCase().includes(q) ||
            teh.name.toLowerCase().includes(q) ||
            dist.name.toLowerCase().includes(q) ||
            prov.name.toLowerCase().includes(q)
          ) {
            results.push({
              provinceName: prov.name,
              districtName: dist.name,
              tehsilName: teh.name,
              cityName: item.name,
              type: item.type,
              lat: item.lat,
              lng: item.lng,
              displayText: `${item.name}, ${teh.name}, ${dist.name}, ${prov.name}`
            });
            if (results.length >= maxResults) return results;
          }
        }
      }
    }
  }

  return results;
}

// Find coordinates for map centering
export function getCoordinatesForLocation(cityOrAreaName: string, districtName?: string): { lat: number; lng: number } {
  const nameClean = cityOrAreaName.toLowerCase();
  
  for (const prov of PAKISTAN_LOCATION_DB) {
    for (const dist of prov.districts) {
      if (districtName && dist.name.toLowerCase() !== districtName.toLowerCase()) continue;
      for (const teh of dist.tehsils) {
        for (const item of teh.citiesOrVillages) {
          if (item.name.toLowerCase().includes(nameClean) || nameClean.includes(item.name.toLowerCase())) {
            return { lat: item.lat, lng: item.lng };
          }
        }
      }
    }
  }

  // Fallbacks for main cities
  if (nameClean.includes('lahore')) return { lat: 31.5204, lng: 74.3587 };
  if (nameClean.includes('karachi')) return { lat: 24.8607, lng: 67.0011 };
  if (nameClean.includes('islamabad')) return { lat: 33.6844, lng: 73.0479 };
  if (nameClean.includes('rawalpindi')) return { lat: 33.5651, lng: 73.0169 };
  if (nameClean.includes('multan')) return { lat: 30.1575, lng: 71.5249 };
  if (nameClean.includes('peshawar')) return { lat: 34.0151, lng: 71.5249 };
  if (nameClean.includes('quetta')) return { lat: 30.1798, lng: 66.9750 };
  if (nameClean.includes('faisalabad')) return { lat: 31.4504, lng: 73.1350 };

  // Center of Pakistan default
  return { lat: 30.3753, lng: 69.3451 };
}
