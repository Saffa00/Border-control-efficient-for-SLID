export interface DutyStationOption {
  id: string;
  name: string;
  category: "Air" | "Sea" | "Land" | "Directorate HQ" | "Regional";
  district: string;
}

export const OFFICIAL_DUTY_STATIONS: DutyStationOption[] = [
  {
    id: "hq-freetown",
    name: "Freetown HQ — Immigration Directorate",
    category: "Directorate HQ",
    district: "Western Area Urban",
  },
  {
    id: "fna-lungi",
    name: "FNA — Freetown International Airport (Lungi)",
    category: "Air",
    district: "Port Loko",
  },
  {
    id: "quay-freetown",
    name: "Queen Elizabeth II Quay (Seaport)",
    category: "Sea",
    district: "Western Area Urban",
  },
  {
    id: "gbalamuya-kambia",
    name: "Gbalamuya Border Post (Guinea Border)",
    category: "Land",
    district: "Kambia",
  },
  {
    id: "jendema-pujehun",
    name: "Jendema Border Post (Liberia Border)",
    category: "Land",
    district: "Pujehun",
  },
  {
    id: "koindu-kailahun",
    name: "Koindu Border Station (Tri-Border)",
    category: "Land",
    district: "Kailahun",
  },
  {
    id: "bo-regional",
    name: "Bo District Regional Immigration Command",
    category: "Regional",
    district: "Bo",
  },
  {
    id: "kenema-regional",
    name: "Kenema Regional Immigration Command",
    category: "Regional",
    district: "Kenema",
  },
  {
    id: "makeni-regional",
    name: "Makeni / Bombali Regional Office",
    category: "Regional",
    district: "Bombali",
  },
  {
    id: "koidu-regional",
    name: "Koidu / Kono Eastern Border Command",
    category: "Regional",
    district: "Kono",
  },
];
