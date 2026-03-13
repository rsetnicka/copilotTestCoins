import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { coins } from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

type CoinSeed = {
  country: string;
  countryCode: string;
  year: number;
  type: "standard" | "commemorative";
  description: string;
  sortOrder: number;
};

// prettier-ignore
const COINS: CoinSeed[] = [
  // ── ANDORRA ────────────────────────────────────────────────────────────────
  { country: "Andorra", countryCode: "AD", year: 2014, type: "standard",       description: "Coat of arms of Andorra",                                      sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2014, type: "commemorative",  description: "20th anniversary of Andorra joining the Council of Europe",     sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2015, type: "commemorative",  description: "25th anniversary of the right to vote",                        sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2016, type: "commemorative",  description: "Policia d'Andorra (police service)",                           sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2017, type: "commemorative",  description: "25th anniversary of the Andorran Constitution",                sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2018, type: "commemorative",  description: "National Archive of Andorra — Casa de la Vall",                sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2019, type: "commemorative",  description: "Dames de Meritxell (Europa series)",                           sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2020, type: "commemorative",  description: "30th anniversary of Andorra joining the Council of Europe",    sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2021, type: "commemorative",  description: "30th anniversary of Andorra joining the United Nations",       sortOrder: 10 },
  { country: "Andorra", countryCode: "AD", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 10 },

  // ── AUSTRIA ────────────────────────────────────────────────────────────────
  { country: "Austria", countryCode: "AT", year: 2002, type: "standard",       description: "Bertha von Suttner — Nobel Peace Prize laureate",             sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2005, type: "commemorative",  description: "50th anniversary of the Austrian State Treaty",               sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2005, type: "commemorative",  description: "50th anniversary of Austrian United Nations membership",       sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2005, type: "commemorative",  description: "10th anniversary of Austria joining the European Union",       sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2009, type: "commemorative",  description: "200th anniversary of the Tyrolean uprising (Andreas Hofer)",  sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2013, type: "commemorative",  description: "150th anniversary of the Austrian Red Cross",                 sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2015, type: "commemorative",  description: "30th anniversary of the EU flag",                             sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2016, type: "commemorative",  description: "200th anniversary of the Austrian National Bank",             sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2018, type: "commemorative",  description: "100th anniversary of the Republic of Austria",                sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2019, type: "commemorative",  description: "100 years of women's suffrage in Austria",                    sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2021, type: "commemorative",  description: "100 years of Burgenland joining Austria",                     sortOrder: 20 },
  { country: "Austria", countryCode: "AT", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 20 },

  // ── BELGIUM ────────────────────────────────────────────────────────────────
  { country: "Belgium", countryCode: "BE", year: 2002, type: "standard",       description: "King Albert II effigy",                                       sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2005, type: "commemorative",  description: "75th anniversary of the Belgium-Luxembourg Economic Union",   sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2006, type: "commemorative",  description: "Reopening of the Atomium, Brussels",                          sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2008, type: "commemorative",  description: "60th anniversary of the Universal Declaration of Human Rights", sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2009, type: "commemorative",  description: "Louis Braille bicentenary",                                   sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2011, type: "commemorative",  description: "100th anniversary of International Women's Day",              sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2012, type: "commemorative",  description: "75th anniversary of the Queen Elisabeth Competition",         sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2013, type: "commemorative",  description: "100th anniversary of the Royal Meteorological Institute of Belgium", sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2014, type: "commemorative",  description: "100th anniversary of the start of World War I",               sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2015, type: "commemorative",  description: "Year of Peace — Peace Bell",                                  sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2016, type: "commemorative",  description: "200th anniversary of the Battle of Waterloo",                 sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2017, type: "commemorative",  description: "200th anniversary of Ghent University",                       sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2018, type: "commemorative",  description: "50th anniversary of the student revolution of May 1968",      sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2019, type: "commemorative",  description: "450th anniversary of Pieter Bruegel the Elder's death",       sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2020, type: "commemorative",  description: "75th anniversary of the liberation of Belgium",               sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2021, type: "commemorative",  description: "Healthcare workers during COVID-19 pandemic",                 sortOrder: 30 },
  { country: "Belgium", countryCode: "BE", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 30 },

  // ── CYPRUS ─────────────────────────────────────────────────────────────────
  { country: "Cyprus",  countryCode: "CY", year: 2008, type: "standard",       description: "Idalia Mouflon — Cyprus's coat of arms",                      sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2015, type: "commemorative",  description: "30th anniversary of the EU flag",                             sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2017, type: "commemorative",  description: "Europa series — Castles: Kyrenia Castle",                     sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2020, type: "commemorative",  description: "35th anniversary of the EU flag (Europa series)",             sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2021, type: "commemorative",  description: "60th anniversary of the Republic of Cyprus",                  sortOrder: 40 },
  { country: "Cyprus",  countryCode: "CY", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 40 },

  // ── ESTONIA ────────────────────────────────────────────────────────────────
  { country: "Estonia", countryCode: "EE", year: 2011, type: "standard",       description: "Map of Estonia",                                              sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2015, type: "commemorative",  description: "30th anniversary of the EU flag",                             sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2017, type: "commemorative",  description: "Europa series — Castles: Toompea Castle, Tallinn",            sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2018, type: "commemorative",  description: "Centenary of the Republic of Estonia",                        sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2020, type: "commemorative",  description: "100th anniversary of the Treaty of Tartu",                    sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2021, type: "commemorative",  description: "Finno-Ugric peoples",                                         sortOrder: 50 },
  { country: "Estonia", countryCode: "EE", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 50 },

  // ── FINLAND ────────────────────────────────────────────────────────────────
  { country: "Finland", countryCode: "FI", year: 2002, type: "standard",       description: "Cloudberry plant (heraldic design)",                          sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2004, type: "commemorative",  description: "EU enlargement — Finland's EU Council Presidency",            sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2006, type: "commemorative",  description: "100 years of universal suffrage in Finland",                  sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2011, type: "commemorative",  description: "200th anniversary of the Bank of Finland",                    sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2015, type: "commemorative",  description: "150th anniversary of Jean Sibelius's birth",                  sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2017, type: "commemorative",  description: "Finland 100 years of independence",                           sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2019, type: "commemorative",  description: "Paavo Nurmi — legendary Finnish long-distance runner",        sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2020, type: "commemorative",  description: "Väinö Linna — Finnish author (100 years)",                    sortOrder: 60 },
  { country: "Finland", countryCode: "FI", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 60 },

  // ── FRANCE ─────────────────────────────────────────────────────────────────
  { country: "France",  countryCode: "FR", year: 2002, type: "standard",       description: "La Semeuse — The Sower",                                      sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2008, type: "commemorative",  description: "French Presidency of the European Union",                     sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2009, type: "commemorative",  description: "Louis Braille bicentenary",                                   sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2010, type: "commemorative",  description: "70th anniversary of de Gaulle's Appeal of June 18",           sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2013, type: "commemorative",  description: "50th anniversary of the Élysée Treaty (Franco-German friendship)", sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2014, type: "commemorative",  description: "70th anniversary of the D-Day landings in Normandy",          sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2015, type: "commemorative",  description: "225th anniversary of the Fête de la Fédération",              sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2016, type: "commemorative",  description: "UEFA Euro 2016 — hosted in France",                           sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2017, type: "commemorative",  description: "Auguste Rodin — 100 years since his death",                   sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2017, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2018, type: "commemorative",  description: "Simone Veil — politician and Holocaust survivor",             sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2018, type: "commemorative",  description: "100th anniversary of the Armistice of World War I",           sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2019, type: "commemorative",  description: "30th anniversary of the fall of the Berlin Wall",             sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2020, type: "commemorative",  description: "80th anniversary of de Gaulle's Appeal of June 18",           sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2021, type: "commemorative",  description: "Paris 2024 Olympic and Paralympic Games",                     sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 70 },
  { country: "France",  countryCode: "FR", year: 2022, type: "commemorative",  description: "Simone de Beauvoir — 50 years since publication of The Second Sex", sortOrder: 70 },

  // ── GERMANY ────────────────────────────────────────────────────────────────
  { country: "Germany", countryCode: "DE", year: 2002, type: "standard",       description: "Brandenburg Gate, Berlin",                                    sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2006, type: "commemorative",  description: "Federal State of Schleswig-Holstein — Holstein Gate, Lübeck", sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2007, type: "commemorative",  description: "Federal State of Mecklenburg-Vorpommern — Schwerin Castle",   sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2008, type: "commemorative",  description: "Federal State of Hamburg — St. Michael's Church",             sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2009, type: "commemorative",  description: "Federal State of Saarland — Ludwigskirche, Saarbrücken",      sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2010, type: "commemorative",  description: "Federal State of Bremen — Bremen Town Hall and Roland",       sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2011, type: "commemorative",  description: "Federal State of North Rhine-Westphalia — Cologne Cathedral", sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2012, type: "commemorative",  description: "Federal State of Bavaria — Neuschwanstein Castle",            sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2013, type: "commemorative",  description: "Federal State of Baden-Württemberg — Maulbronn Monastery",    sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2013, type: "commemorative",  description: "50th anniversary of the Élysée Treaty",                       sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2014, type: "commemorative",  description: "Federal State of Lower Saxony — St. Michael's Church, Hildesheim", sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2015, type: "commemorative",  description: "Federal State of Hesse — Frankfurt skyline",                  sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2015, type: "commemorative",  description: "25 years of German reunification",                            sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2016, type: "commemorative",  description: "Federal State of Saxony — Zwinger Palace, Dresden",           sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2017, type: "commemorative",  description: "Federal State of Rhineland-Palatinate — Porta Nigra, Trier",  sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2017, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2018, type: "commemorative",  description: "Federal State of Berlin — Berlin Palace (Humboldt Forum)",    sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2019, type: "commemorative",  description: "Federal State of Thuringia — Wartburg Castle",                sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2019, type: "commemorative",  description: "70 years of the Bundesrat",                                   sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2020, type: "commemorative",  description: "Federal State of Brandenburg — Sanssouci Palace, Potsdam",    sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2020, type: "commemorative",  description: "50 years of Willy Brandt's Warsaw kneeling gesture",          sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2021, type: "commemorative",  description: "Federal State of Saxony-Anhalt — Magdeburg Cathedral",        sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 80 },
  { country: "Germany", countryCode: "DE", year: 2023, type: "commemorative",  description: "Federal State of Hamburg — Hamburg Town Hall (2nd series)",   sortOrder: 80 },

  // ── GREECE ─────────────────────────────────────────────────────────────────
  { country: "Greece",  countryCode: "GR", year: 2002, type: "standard",       description: "Europa and the Bull — ancient Greek myth",                    sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2004, type: "commemorative",  description: "2004 Athens Summer Olympic Games",                            sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2010, type: "commemorative",  description: "2500 years since the Battle of Marathon",                     sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2011, type: "commemorative",  description: "Special Olympics World Summer Games, Athens",                 sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2013, type: "commemorative",  description: "2400 years since the founding of Plato's Academy",            sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2014, type: "commemorative",  description: "El Greco — 400 years since his death",                        sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2015, type: "commemorative",  description: "2400th anniversary of the birth of Aristotle",                sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2016, type: "commemorative",  description: "150th anniversary of the Arkadi Monastery event",             sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2017, type: "commemorative",  description: "Archaeological site of Philippi",                             sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2018, type: "commemorative",  description: "Ancient Oracle of Dodona",                                    sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2019, type: "commemorative",  description: "Spyros Louis — winner of the first modern Olympic marathon",  sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2020, type: "commemorative",  description: "2500th anniversary of the Battle of Thermopylae",             sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2021, type: "commemorative",  description: "200 years of the Greek Revolution (independence)",            sortOrder: 90 },
  { country: "Greece",  countryCode: "GR", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 90 },

  // ── IRELAND ────────────────────────────────────────────────────────────────
  { country: "Ireland", countryCode: "IE", year: 2002, type: "standard",       description: "Irish harp (Brian Boru's harp)",                              sortOrder: 100 },
  { country: "Ireland", countryCode: "IE", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 100 },
  { country: "Ireland", countryCode: "IE", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 100 },
  { country: "Ireland", countryCode: "IE", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 100 },
  { country: "Ireland", countryCode: "IE", year: 2016, type: "commemorative",  description: "100th anniversary of the Easter Rising",                      sortOrder: 100 },
  { country: "Ireland", countryCode: "IE", year: 2019, type: "commemorative",  description: "100 years of the first sitting of Dáil Éireann",              sortOrder: 100 },
  { country: "Ireland", countryCode: "IE", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 100 },

  // ── ITALY ──────────────────────────────────────────────────────────────────
  { country: "Italy",   countryCode: "IT", year: 2002, type: "standard",       description: "Dante Alighieri — Divine Comedy",                             sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2004, type: "commemorative",  description: "World Food Programme",                                        sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2005, type: "commemorative",  description: "World Year of Physics — centenary of Albert Einstein's Annus Mirabilis", sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2006, type: "commemorative",  description: "2006 Winter Olympics, Turin",                                  sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2006, type: "commemorative",  description: "60th anniversary of the Italian Republic",                    sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2008, type: "commemorative",  description: "60th anniversary of the Italian Constitution",                sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2009, type: "commemorative",  description: "International Year of Astronomy — Galileo Galilei",           sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2010, type: "commemorative",  description: "150 years of Italian unification — Camillo di Cavour",        sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2011, type: "commemorative",  description: "150th anniversary of the unification of Italy",               sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2013, type: "commemorative",  description: "Giuseppe Verdi — bicentenary of his birth",                   sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2014, type: "commemorative",  description: "200th anniversary of the Carabinieri corps",                  sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2015, type: "commemorative",  description: "Expo 2015 Milano — Feeding the Planet",                       sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2016, type: "commemorative",  description: "2200th anniversary of the death of Titus Maccius Plautus",    sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2017, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2018, type: "commemorative",  description: "60 years of the Carabinieri horseback unit",                  sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2019, type: "commemorative",  description: "500 years since the death of Leonardo da Vinci",              sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2021, type: "commemorative",  description: "150 years of Rome as the capital of Italy",                   sortOrder: 110 },
  { country: "Italy",   countryCode: "IT", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 110 },

  // ── LATVIA ─────────────────────────────────────────────────────────────────
  { country: "Latvia",  countryCode: "LV", year: 2014, type: "standard",       description: "Large coat of arms of Latvia",                                sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2015, type: "commemorative",  description: "Latvian Presidency of the EU Council",                        sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2016, type: "commemorative",  description: "Vidzeme region",                                              sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2017, type: "commemorative",  description: "Kurzeme region; Europa series — Castles (Turaida Castle)",    sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2018, type: "commemorative",  description: "Zemgale region; 100th anniversary of the Republic of Latvia", sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2019, type: "commemorative",  description: "Latgale region; Rising sun (European flag)",                  sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2020, type: "commemorative",  description: "100th anniversary of the Latvian de jure recognition",        sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2021, type: "commemorative",  description: "100 years of Latvia–Lithuania border",                        sortOrder: 120 },
  { country: "Latvia",  countryCode: "LV", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 120 },

  // ── LITHUANIA ──────────────────────────────────────────────────────────────
  { country: "Lithuania", countryCode: "LT", year: 2015, type: "standard",     description: "Vytis — the Lithuanian Knight",                               sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2015, type: "commemorative","description": "Lithuanian Presidency of the EU Council",                   sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2017, type: "commemorative","description": "Vilnius University — 440 years anniversary",                sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2018, type: "commemorative","description": "100th anniversary of the restoration of the State of Lithuania", sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2019, type: "commemorative","description": "Žemaitija (Samogitia) ethnographic region",                 sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2020, type: "commemorative","description": "Hill of Crosses — national pilgrimage site",                sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2021, type: "commemorative","description": "Dzūkija (Dainava) ethnographic region",                     sortOrder: 130 },
  { country: "Lithuania", countryCode: "LT", year: 2022, type: "commemorative","description": "35th anniversary of the Erasmus programme",                 sortOrder: 130 },

  // ── LUXEMBOURG ─────────────────────────────────────────────────────────────
  { country: "Luxembourg", countryCode: "LU", year: 2002, type: "standard",    description: "Grand Duke Henri of Luxembourg",                              sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2004, type: "commemorative","description": "Monogram of Grand Duke Henri",                             sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2005, type: "commemorative","description": "80th birthday of Grand Duke Jean",                         sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2006, type: "commemorative","description": "25th birthday of Grand Duke Guillaume",                    sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2007, type: "commemorative","description": "50th anniversary of the Treaty of Rome; Grand Ducal Palace", sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2008, type: "commemorative","description": "50th anniversary of the accession of Grand Duke Jean",     sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2009, type: "commemorative","description": "10th anniversary of Economic and Monetary Union; Charlotte Bridge", sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2010, type: "commemorative","description": "Coat of arms of Luxembourg",                               sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2011, type: "commemorative","description": "50th anniversary of Grand Duke Henri's birth",             sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2012, type: "commemorative","description": "10 years of euro coins; Royal Wedding of Guillaume and Stéphanie", sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2013, type: "commemorative","description": "National Anthem of Luxembourg",                            sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2014, type: "commemorative","description": "150 years of independence and neutrality of Luxembourg",   sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2015, type: "commemorative","description": "15th anniversary of the accession of Grand Duke Henri",    sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2016, type: "commemorative","description": "Countess of Luxembourg (Europa series)",                   sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2017, type: "commemorative","description": "200 years of volunteer fire brigades",                     sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2018, type: "commemorative","description": "175 years of Luxembourgish National Day",                  sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2019, type: "commemorative","description": "100 years of women's suffrage in Luxembourg",              sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2020, type: "commemorative","description": "200 years of the death of General Michel de la Closerie", sortOrder: 140 },
  { country: "Luxembourg", countryCode: "LU", year: 2022, type: "commemorative","description": "35th anniversary of the Erasmus programme",               sortOrder: 140 },

  // ── MALTA ──────────────────────────────────────────────────────────────────
  { country: "Malta",   countryCode: "MT", year: 2008, type: "standard",       description: "Cross of Malta — Maltese Cross",                              sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2011, type: "commemorative",  description: "Auberge de Castille, Valletta",                               sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2013, type: "commemorative",  description: "George Cross awarded to Malta in WWII",                       sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2014, type: "commemorative",  description: "Founding of the Order of Malta (1113)",                       sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2015, type: "commemorative",  description: "Republic of Malta — 40th anniversary",                        sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2016, type: "commemorative",  description: "Love — Europa series",                                        sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2017, type: "commemorative",  description: "Maltese Presidency of the EU Council; Hagar Qim temples",     sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2018, type: "commemorative",  description: "Cultural Heritage — Calypso's Cave",                          sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2019, type: "commemorative",  description: "50 years of Children's Rights",                               sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2020, type: "commemorative",  description: "100 years of the Maltese Police Force",                       sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2021, type: "commemorative",  description: "Malta - EU accession 15th anniversary",                       sortOrder: 150 },
  { country: "Malta",   countryCode: "MT", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 150 },

  // ── MONACO ─────────────────────────────────────────────────────────────────
  { country: "Monaco",  countryCode: "MC", year: 2002, type: "standard",       description: "Prince Rainier III of Monaco",                                sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2011, type: "commemorative",  description: "Royal Wedding of Prince Albert II and Charlene Wittstock",    sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2012, type: "commemorative",  description: "10 years of euro coins and banknotes",                        sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2013, type: "commemorative",  description: "UNESCO World Heritage Site — Old Town of Monaco",             sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2014, type: "commemorative",  description: "Prince Albert I's oceanographic work",                        sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2015, type: "commemorative",  description: "800 years of the Grimaldi dynasty",                           sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2016, type: "commemorative",  description: "150 years of the sovereignty of Monaco",                      sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2017, type: "commemorative",  description: "200 years of the Carabinieri of Monaco",                      sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2019, type: "commemorative",  description: "150 years of the first Monaco circus",                        sortOrder: 160 },
  { country: "Monaco",  countryCode: "MC", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 160 },

  // ── NETHERLANDS ────────────────────────────────────────────────────────────
  { country: "Netherlands", countryCode: "NL", year: 2002, type: "standard",   description: "Queen Beatrix — profile portrait",                            sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2007, type: "commemorative","description": "50th anniversary of the Treaty of Rome",                  sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2009, type: "commemorative","description": "10th anniversary of Economic and Monetary Union",         sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2011, type: "commemorative","description": "500 years of Erasmus of Rotterdam",                       sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2012, type: "commemorative","description": "10 years of euro coins and banknotes",                    sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2013, type: "commemorative","description": "200 years of the Kingdom of the Netherlands",             sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2014, type: "commemorative","description": "Double portrait: King Willem-Alexander and Queen Máxima", sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2015, type: "commemorative","description": "30 years of the EU flag",                                  sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2017, type: "commemorative","description": "50 years of the Treaty of Rome",                          sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2018, type: "commemorative","description": "100 years of universal suffrage in the Netherlands",      sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2020, type: "commemorative","description": "75 years of peace and freedom in the Netherlands",        sortOrder: 170 },
  { country: "Netherlands", countryCode: "NL", year: 2022, type: "commemorative","description": "35th anniversary of the Erasmus programme",               sortOrder: 170 },

  // ── PORTUGAL ───────────────────────────────────────────────────────────────
  { country: "Portugal", countryCode: "PT", year: 2002, type: "standard",      description: "Royal seal of 1144 — first Portuguese king",                  sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2007, type: "commemorative", description: "50th anniversary of the Treaty of Rome",                      sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2008, type: "commemorative", description: "Portuguese Presidency of the EU Council",                     sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2009, type: "commemorative", description: "10th anniversary of Economic and Monetary Union",             sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2012, type: "commemorative", description: "Guimarães — European Capital of Culture 2012",                sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2014, type: "commemorative", description: "International Year of Family Farming",                        sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2015, type: "commemorative", description: "30 years of Portugal's EU membership",                        sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2017, type: "commemorative", description: "50 years of the Treaty of Rome",                              sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2018, type: "commemorative", description: "250 years of the Ajuda National Botanical Garden",            sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2019, type: "commemorative", description: "100 years of the first aerial crossing of the South Atlantic", sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2020, type: "commemorative", description: "75 years of the United Nations",                              sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2021, type: "commemorative", description: "500 years of the circumnavigation of the Earth",              sortOrder: 180 },
  { country: "Portugal", countryCode: "PT", year: 2022, type: "commemorative", description: "35th anniversary of the Erasmus programme",                   sortOrder: 180 },

  // ── SAN MARINO ─────────────────────────────────────────────────────────────
  { country: "San Marino", countryCode: "SM", year: 2002, type: "standard",    description: "Three Towers of San Marino — Guaita, Cesta and Montale",      sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2004, type: "commemorative","description": "Bartolomeo Borghesi — historian",                          sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2005, type: "commemorative","description": "Galileo Galilei — astronomer",                             sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2006, type: "commemorative","description": "Columbus (discovery of Americas)",                          sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2007, type: "commemorative","description": "50th anniversary of the Treaty of Rome; Giuseppe Garibaldi", sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2008, type: "commemorative","description": "Bartolomeo Borghesi (2nd)",                                sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2009, type: "commemorative","description": "10th anniversary of Economic and Monetary Union; Louis Braille bicentenary", sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2010, type: "commemorative","description": "Sandro Botticelli — painter",                              sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2011, type: "commemorative","description": "500th anniversary of the death of Giovanni Aldini",        sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2012, type: "commemorative","description": "10 years of euro coins; Bramante — architect",             sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2013, type: "commemorative","description": "500 years Palazzo Pubblico",                               sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2014, type: "commemorative","description": "Donato Bramante bicentenary",                              sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2015, type: "commemorative","description": "700th anniversary of the founding of San Marino",          sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2016, type: "commemorative","description": "Donatello — sculptor",                                     sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2017, type: "commemorative","description": "50 years of the Treaty of Rome; Francesco Borromini",      sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2018, type: "commemorative","description": "Gian Lorenzo Bernini — sculptor and architect",            sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2019, type: "commemorative","description": "500th anniversary of death of Leonardo da Vinci",          sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2020, type: "commemorative","description": "Alessandro Volta — 275th anniversary",                     sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2021, type: "commemorative","description": "Alessandro Volta (second edition)",                        sortOrder: 190 },
  { country: "San Marino", countryCode: "SM", year: 2022, type: "commemorative","description": "35th anniversary of the Erasmus programme",               sortOrder: 190 },

  // ── SLOVAKIA ───────────────────────────────────────────────────────────────
  { country: "Slovakia", countryCode: "SK", year: 2009, type: "standard",      description: "Kriváň peak — symbol of Slovak landscape",                    sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2009, type: "commemorative", description: "10th anniversary of Economic and Monetary Union",             sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2012, type: "commemorative", description: "10 years of euro coins and banknotes",                        sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2013, type: "commemorative", description: "1150 years since the arrival of Saints Cyril and Methodius",  sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2014, type: "commemorative", description: "10 years of Slovakia's EU membership",                        sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2016, type: "commemorative", description: "Slovak Presidency of the EU Council",                         sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2017, type: "commemorative", description: "25th anniversary of the Slovak Republic",                     sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2018, type: "commemorative", description: "100th anniversary of the Czech-Slovak state",                  sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2019, type: "commemorative", description: "100 years of Slovak Philharmonic",                            sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2020, type: "commemorative", description: "100 years of the Slovak National Theatre",                    sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2021, type: "commemorative", description: "100 years of the Slovak Technical University in Bratislava",  sortOrder: 200 },
  { country: "Slovakia", countryCode: "SK", year: 2022, type: "commemorative", description: "35th anniversary of the Erasmus programme",                   sortOrder: 200 },

  // ── SLOVENIA ───────────────────────────────────────────────────────────────
  { country: "Slovenia", countryCode: "SI", year: 2007, type: "standard",      description: "Primož Trubar — reformer and father of Slovenian literature",  sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2007, type: "commemorative", description: "50th anniversary of the Treaty of Rome",                      sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2008, type: "commemorative", description: "Slovenian Presidency of the EU Council",                      sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2009, type: "commemorative", description: "10th anniversary of Economic and Monetary Union",             sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2010, type: "commemorative", description: "200 years of the Botanical Garden in Ljubljana",              sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2011, type: "commemorative", description: "100 years of the first flight over the Alps",                  sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2012, type: "commemorative", description: "10 years of euro coins and banknotes",                        sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2013, type: "commemorative", description: "800 years of the Postojna Cave discoveries",                  sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2014, type: "commemorative", description: "600 years of the Koper Castle/Praetorian Palace",             sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2015, type: "commemorative", description: "30 years of the EU flag",                                     sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2016, type: "commemorative", description: "800 years of Škocjan Caves (UNESCO heritage)",                sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2017, type: "commemorative", description: "50 years of the Treaty of Rome",                              sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2018, type: "commemorative", description: "100 years of the end of WWI",                                 sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2019, type: "commemorative", description: "100 years of the University of Ljubljana",                    sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2021, type: "commemorative", description: "Slovenian Presidency of the EU Council",                      sortOrder: 210 },
  { country: "Slovenia", countryCode: "SI", year: 2022, type: "commemorative", description: "35th anniversary of the Erasmus programme",                   sortOrder: 210 },

  // ── SPAIN ──────────────────────────────────────────────────────────────────
  { country: "Spain",   countryCode: "ES", year: 2002, type: "standard",       description: "Miguel de Cervantes — author of Don Quixote",                 sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2005, type: "commemorative",  description: "400th anniversary of the publication of Don Quixote",         sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2007, type: "commemorative",  description: "50th anniversary of the Treaty of Rome",                      sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2009, type: "commemorative",  description: "10th anniversary of Economic and Monetary Union",             sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2010, type: "commemorative",  description: "UNESCO World Heritage — Córdoba Mosque-Cathedral",            sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2011, type: "commemorative",  description: "UNESCO World Heritage — Alhambra, Granada",                   sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2012, type: "commemorative",  description: "UNESCO World Heritage — Burgos Cathedral; 10 years euro",     sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2013, type: "commemorative",  description: "UNESCO World Heritage — El Escorial Monastery",               sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2014, type: "commemorative",  description: "UNESCO World Heritage — Park Güell, Antoni Gaudí",            sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2015, type: "commemorative",  description: "UNESCO World Heritage — Passeig de Gràcia (Casa Batlló)",     sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2016, type: "commemorative",  description: "UNESCO World Heritage — Aguilar de Campoo Monastery",        sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2017, type: "commemorative",  description: "50 years of the Treaty of Rome; Salamanca Old City",          sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2018, type: "commemorative",  description: "UNESCO World Heritage — Pillar of Zaragoza",                  sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2019, type: "commemorative",  description: "50 years of the King's birthday (Europa series)",             sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2020, type: "commemorative",  description: "UNESCO World Heritage — Garajonay National Park",             sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2021, type: "commemorative",  description: "UNESCO World Heritage — Toledo historic city",                sortOrder: 220 },
  { country: "Spain",   countryCode: "ES", year: 2022, type: "commemorative",  description: "35th anniversary of the Erasmus programme",                   sortOrder: 220 },

  // ── VATICAN CITY ───────────────────────────────────────────────────────────
  { country: "Vatican City", countryCode: "VA", year: 2002, type: "standard",  description: "Pope John Paul II portrait",                                  sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2004, type: "commemorative","description": "75th anniversary of Vatican City State",                  sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2005, type: "commemorative","description": "World Youth Day, Cologne — sede vacante",                 sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2005, type: "commemorative","description": "Pope Benedict XVI — 1st year of pontificate",             sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2006, type: "commemorative","description": "Pope Benedict XVI — 2nd year of pontificate",             sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2007, type: "commemorative","description": "50th anniversary of the Treaty of Rome; Pope Benedict XVI 3rd year", sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2008, type: "commemorative","description": "Pope Benedict XVI — 3rd year (World Youth Day Sydney)",   sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2009, type: "commemorative","description": "10th anniversary of Economic and Monetary Union; Year of Astronomy", sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2010, type: "commemorative","description": "Pope Benedict XVI — Year for Priests",                    sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2011, type: "commemorative","description": "Pope Benedict XVI — World Youth Day, Madrid",             sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2012, type: "commemorative","description": "10 years of euro coins; Pope Benedict XVI — Synod of Bishops", sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2013, type: "commemorative","description": "Pope Francis — sede vacante; conclave 2013",              sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2014, type: "commemorative","description": "Pope Francis — 1st year; canonization of Popes",          sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2015, type: "commemorative","description": "Pope Francis — 8th World Meeting of Families",            sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2016, type: "commemorative","description": "Pope Francis — World Youth Day, Kraków",                  sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2017, type: "commemorative","description": "50th anniversary of the Treaty of Rome; Pope Francis 5th year", sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2018, type: "commemorative","description": "Pope Francis — World Youth Day, Panama",                  sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2019, type: "commemorative","description": "Pope Francis — Year of Youth (Christus vivit)",           sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2020, type: "commemorative","description": "Pope Francis — 8th year of pontificate",                  sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2021, type: "commemorative","description": "Pope Francis — World Youth Day, Lisbon",                  sortOrder: 230 },
  { country: "Vatican City", countryCode: "VA", year: 2022, type: "commemorative","description": "35th anniversary of the Erasmus programme",               sortOrder: 230 },
];

async function seed() {
  console.log(`🌱 Seeding ${COINS.length} coins...`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < COINS.length; i += batchSize) {
    const batch = COINS.slice(i, i + batchSize);
    await db.insert(coins).values(batch).onConflictDoNothing();
    console.log(`  ✓ Inserted batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log("✅ Seed complete!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
