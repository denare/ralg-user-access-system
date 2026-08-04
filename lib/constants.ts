export const systemsCatalog = [
  "FFARS", "eOffice", "LGRCIS", "PLANREP", "MUSE", "IMES", "LAAMP", "GOVHOMIS",
  "GMS", "MADENI MIS", "NeST", "JETMIS", "eBOARD", "TAUSI", "PREMS", "VPN", "Domain"
] as const;

export const lgasByRegion = {
  Arusha: ["Arusha CC", "Arusha DC", "Karatu DC", "Longido DC", "Meru DC", "Monduli DC", "Ngorongoro DC"],
  "Dar es Salaam": ["Dar es Salaam CC", "Kigamboni MC", "Kinondoni MC", "Temeke MC", "Ubungo MC"],
  Dodoma: ["Bahi DC", "Chamwino DC", "Chemba DC", "Dodoma CC", "Kondoa DC", "Kondoa TC", "Kongwa DC", "Mpwapwa DC"],
  Geita: ["Bukombe DC", "Chato DC", "Geita DC", "Geita TC", "Mbogwe DC", "Nyang'hwale DC"],
  Iringa: ["Iringa DC", "Iringa MC", "Kilolo DC", "Mafinga TC", "Mufindi DC"],
  Kagera: ["Biharamulo DC", "Bukoba DC", "Bukoba MC", "Karagwe DC", "Kyerwa DC", "Missenyi DC", "Muleba DC", "Ngara DC"],
  Katavi: ["Mlele DC", "Mpanda MC", "Mpimbwe DC", "Nsimbo DC", "Tanganyika DC"],
  Kigoma: ["Buhigwe DC", "Kakonko DC", "Kasulu DC", "Kasulu TC", "Kibondo DC", "Kigoma DC", "Kigoma-Ujiji MC", "Uvinza DC"],
  Kilimanjaro: ["Hai DC", "Moshi DC", "Moshi MC", "Mwanga DC", "Rombo DC", "Same DC", "Siha DC"],
  Lindi: ["Kilwa DC", "Lindi DC", "Lindi MC", "Liwale DC", "Nachingwea DC", "Ruangwa DC"],
  Manyara: ["Babati DC", "Babati TC", "Hanang DC", "Kiteto DC", "Mbulu DC", "Mbulu TC", "Simanjiro DC"],
  Mara: ["Bunda DC", "Bunda TC", "Butiama DC", "Musoma DC", "Musoma MC", "Rorya DC", "Serengeti DC", "Tarime DC", "Tarime TC"],
  Mbeya: ["Busokelo DC", "Chunya DC", "Kyela DC", "Mbarali DC", "Mbeya CC", "Mbeya DC", "Rungwe DC"],
  Morogoro: ["Gairo DC", "Ifakara TC", "Kilombero DC", "Kilosa DC", "Malinyi DC", "Morogoro DC", "Morogoro MC", "Mvomero DC", "Ulanga DC"],
  Mtwara: ["Masasi DC", "Masasi TC", "Mtwara DC", "Mtwara MC", "Nanyamba TC", "Nanyumbu DC", "Newala DC", "Newala TC", "Tandahimba DC"],
  Mwanza: ["Buchosa DC", "Ilemela MC", "Kwimba DC", "Magu DC", "Misungwi DC", "Mwanza CC", "Sengerema DC", "Ukerewe DC"],
  Njombe: ["Ludewa DC", "Makambako TC", "Makete DC", "Njombe DC", "Njombe TC", "Wanging'ombe DC"],
  Pwani: ["Chalinze DC", "Kibaha DC", "Kibaha MC", "Rufiji DC", "Bagamoyo DC", "Mkuranga DC", "Kibiti DC", "Mafia DC", "Kisarawe DC"],
  Rukwa: ["Kalambo DC", "Nkasi DC", "Sumbawanga DC", "Sumbawanga MC"],
  Ruvuma: ["Madaba DC", "Mbinga DC", "Mbinga TC", "Namtumbo DC", "Nyasa DC", "Songea DC", "Songea MC", "Tunduru DC"],
  Shinyanga: ["Kahama MC", "Kishapu DC", "Msalala DC", "Shinyanga DC", "Shinyanga MC", "Ushetu DC"],
  Simiyu: ["Bariadi DC", "Bariadi TC", "Busega DC", "Itilima DC", "Maswa DC", "Meatu DC"],
  Singida: ["Ikungi DC", "Iramba DC", "Itigi DC", "Manyoni DC", "Mkalama DC", "Singida DC", "Singida MC"],
  Songwe: ["Ileje DC", "Mbozi DC", "Momba DC", "Songwe DC", "Tunduma TC"],
  Tabora: ["Igunga DC", "Kaliua DC", "Nzega DC", "Nzega TC", "Sikonge DC", "Tabora MC", "Urambo DC", "Uyui DC"],
  Tanga: ["Bumbuli DC", "Handeni DC", "Handeni TC", "Kilindi DC", "Korogwe DC", "Korogwe TC", "Lushoto DC", "Mkinga DC", "Muheza DC", "Pangani DC", "Tanga CC"]
} as const;

export type Region = keyof typeof lgasByRegion;
export const regions = Object.keys(lgasByRegion) as Region[];
