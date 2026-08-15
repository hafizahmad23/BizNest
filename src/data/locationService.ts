import { 
  PAKISTAN_LOCATION_DB, 
  ProvinceItem, 
  DistrictItem, 
  TehsilItem, 
  CityOrVillageItem,
  getCoordinatesForLocation 
} from './pakistanLocations';
import { Business } from '../types';

export interface LocationSearchResult {
  name: string;
  type: 'province' | 'district' | 'tehsil' | 'city_village';
  hierarchyPath: string; // e.g., "Punjab → Lahore → Lahore City → Gulberg"
  provinceName: string;
  districtName?: string;
  tehsilName?: string;
  item?: CityOrVillageItem | TehsilItem | DistrictItem | ProvinceItem;
}

export interface LocationStats {
  totalProvinces: number;
  totalDistricts: number;
  totalTehsils: number;
  totalAreasAndVillages: number;
}

/**
 * Service to manage & query Pakistan's 4-Tier Administrative Location Hierarchy:
 * Province → District → Tehsil → City / Village / Sector
 */
export const locationService = {
  /**
   * Get all Provinces in Pakistan
   */
  getProvinces(): ProvinceItem[] {
    return PAKISTAN_LOCATION_DB;
  },

  /**
   * Get Districts for a given Province (by ID or Name)
   */
  getDistricts(provinceNameOrId?: string): DistrictItem[] {
    if (!provinceNameOrId || provinceNameOrId === 'all' || provinceNameOrId === 'All Pakistan') {
      return PAKISTAN_LOCATION_DB.flatMap(p => p.districts);
    }

    const province = PAKISTAN_LOCATION_DB.find(
      p => p.id.toLowerCase() === provinceNameOrId.toLowerCase() || 
           p.name.toLowerCase() === provinceNameOrId.toLowerCase() ||
           p.code.toLowerCase() === provinceNameOrId.toLowerCase()
    );

    return province ? province.districts : [];
  },

  /**
   * Get Tehsils for a given District
   */
  getTehsils(districtNameOrId?: string, provinceNameOrId?: string): TehsilItem[] {
    const districts = this.getDistricts(provinceNameOrId);

    if (!districtNameOrId || districtNameOrId === 'all' || districtNameOrId === 'All Districts') {
      return districts.flatMap(d => d.tehsils);
    }

    const district = districts.find(
      d => d.id.toLowerCase() === districtNameOrId.toLowerCase() ||
           d.name.toLowerCase() === districtNameOrId.toLowerCase()
    );

    return district ? district.tehsils : [];
  },

  /**
   * Get Cities, Towns, Villages or Areas for a given Tehsil
   */
  getCitiesOrVillages(tehsilNameOrId?: string, districtNameOrId?: string, provinceNameOrId?: string): CityOrVillageItem[] {
    const tehsils = this.getTehsils(districtNameOrId, provinceNameOrId);

    if (!tehsilNameOrId || tehsilNameOrId === 'all' || tehsilNameOrId === 'All Tehsils') {
      return tehsils.flatMap(t => t.citiesOrVillages);
    }

    const tehsil = tehsils.find(
      t => t.id.toLowerCase() === tehsilNameOrId.toLowerCase() ||
           t.name.toLowerCase() === tehsilNameOrId.toLowerCase()
    );

    return tehsil ? tehsil.citiesOrVillages : [];
  },

  /**
   * Search for any matching location across all 4 tiers
   */
  searchLocations(query: string, maxResults = 15): LocationSearchResult[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results: LocationSearchResult[] = [];

    for (const province of PAKISTAN_LOCATION_DB) {
      if (province.name.toLowerCase().includes(cleanQuery)) {
        results.push({
          name: province.name,
          type: 'province',
          hierarchyPath: province.name,
          provinceName: province.name,
          item: province
        });
      }

      for (const district of province.districts) {
        if (district.name.toLowerCase().includes(cleanQuery)) {
          results.push({
            name: district.name,
            type: 'district',
            hierarchyPath: `${province.name} → ${district.name}`,
            provinceName: province.name,
            districtName: district.name,
            item: district
          });
        }

        for (const tehsil of district.tehsils) {
          if (tehsil.name.toLowerCase().includes(cleanQuery)) {
            results.push({
              name: tehsil.name,
              type: 'tehsil',
              hierarchyPath: `${province.name} → ${district.name} → ${tehsil.name}`,
              provinceName: province.name,
              districtName: district.name,
              tehsilName: tehsil.name,
              item: tehsil
            });
          }

          for (const item of tehsil.citiesOrVillages) {
            if (item.name.toLowerCase().includes(cleanQuery)) {
              results.push({
                name: item.name,
                type: 'city_village',
                hierarchyPath: `${province.name} → ${district.name} → ${tehsil.name} → ${item.name}`,
                provinceName: province.name,
                districtName: district.name,
                tehsilName: tehsil.name,
                item: item
              });
            }
          }
        }
      }
    }

    return results.slice(0, maxResults);
  },

  /**
   * Find full hierarchy path for a location name
   */
  findLocationHierarchy(name: string) {
    const clean = name.trim().toLowerCase();
    if (!clean || clean === 'all' || clean === 'all pakistan') return null;

    for (const province of PAKISTAN_LOCATION_DB) {
      if (province.name.toLowerCase() === clean) {
        return { province: province.name, district: null, tehsil: null, village: null };
      }
      for (const district of province.districts) {
        if (district.name.toLowerCase() === clean) {
          return { province: province.name, district: district.name, tehsil: null, village: null };
        }
        for (const tehsil of district.tehsils) {
          if (tehsil.name.toLowerCase() === clean) {
            return { province: province.name, district: district.name, tehsil: tehsil.name, village: null };
          }
          for (const village of tehsil.citiesOrVillages) {
            if (village.name.toLowerCase() === clean) {
              return { province: province.name, district: district.name, tehsil: tehsil.name, village: village.name };
            }
          }
        }
      }
    }
    return null;
  },

  /**
   * Filter business array by location filter (handles province/district/tehsil/city matching)
   */
  filterBusinessesByLocation<T extends { city: string; address?: string; province?: string }>(
    businesses: T[],
    selectedLocation: string
  ): T[] {
    const cleanLoc = selectedLocation.trim().toLowerCase();
    if (
      !cleanLoc || 
      cleanLoc === 'all' || 
      cleanLoc === 'all pakistan' || 
      cleanLoc === 'all districts' || 
      cleanLoc === 'all tehsils' || 
      cleanLoc === 'all areas'
    ) {
      return businesses;
    }

    const hierarchy = this.findLocationHierarchy(selectedLocation);

    return businesses.filter(b => {
      const cityLower = b.city.toLowerCase();
      const addrLower = (b.address || '').toLowerCase();
      const provLower = (b.province || '').toLowerCase();

      // Direct string match
      if (cityLower === cleanLoc || cityLower.includes(cleanLoc) || addrLower.includes(cleanLoc) || provLower.includes(cleanLoc)) {
        return true;
      }

      // Hierarchy match if available
      if (hierarchy) {
        if (hierarchy.province && (provLower.includes(hierarchy.province.toLowerCase()) || addrLower.includes(hierarchy.province.toLowerCase()))) {
          return true;
        }
        if (hierarchy.district && (cityLower.includes(hierarchy.district.toLowerCase()) || addrLower.includes(hierarchy.district.toLowerCase()))) {
          return true;
        }
        if (hierarchy.tehsil && (cityLower.includes(hierarchy.tehsil.toLowerCase()) || addrLower.includes(hierarchy.tehsil.toLowerCase()))) {
          return true;
        }
      }

      return false;
    });
  },

  /**
   * Get total database statistics across Pakistan
   */
  getStats(): LocationStats {
    let totalDistricts = 0;
    let totalTehsils = 0;
    let totalAreasAndVillages = 0;

    for (const p of PAKISTAN_LOCATION_DB) {
      totalDistricts += p.districts.length;
      for (const d of p.districts) {
        totalTehsils += d.tehsils.length;
        for (const t of d.tehsils) {
          totalAreasAndVillages += t.citiesOrVillages.length;
        }
      }
    }

    return {
      totalProvinces: PAKISTAN_LOCATION_DB.length,
      totalDistricts,
      totalTehsils,
      totalAreasAndVillages
    };
  },

  /**
   * Helper to get coordinates for map view
   */
  getCoordinates(name: string, district?: string) {
    return getCoordinatesForLocation(name, district);
  }
};
