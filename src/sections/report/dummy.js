import { faker } from "@faker-js/faker";

export const timeColumns = [
  "07-08",
  "08-09",
  "09-10",
  "10-11",
  "11-12",
  "12-13",
  "13-14",
  "14-15",
  "15-16",
  "16-17",
];

const randomTimeValues = () => {
  const obj = {};
  timeColumns.forEach((t) => {
    obj[t] = faker.number.int({ min: 0, max: 5 });
  });
  return obj;
};

const generateTruck = (id) => ({
  id: `truck-${id}`,
  truck: faker.string.alphanumeric({ length: 6, casing: "upper" }),
  operator: faker.person.fullName(),
  distance: faker.number.int({ min: 500, max: 2500 }),
  ...randomTimeValues(),
});

const generateDigger = (id, truckCount) => ({
  id: `digger-${id}`,
  digger: faker.string.alphanumeric({ length: 6, casing: "upper" }),
  operator: faker.person.fullName(),
  model: faker.helpers.arrayElement(["CAT340", "CAT345", "SEM636"]),
  activity: faker.helpers.arrayElement(["CLAY", "SUB SOIL", "CG", "CH"]),
  plan: faker.number.int({ min: 100, max: 300 }),
  trucks: Array.from({ length: truckCount }, (_, t) =>
    generateTruck(id * 10 + (t + 1))
  ),
});

export const generateDummyData = () => {
  const sections = [
    { id: "section-1", section: "OVERBURDEN", diggerCount: 3 },
    { id: "section-2", section: "COAL GETTING", diggerCount: 2 },
    { id: "section-3", section: "COAL HAULING", diggerCount: 1 },
  ];

  return sections.map((section, sIdx) => {
    const diggers = Array.from({ length: section.diggerCount }, (_, dIdx) =>
      generateDigger(dIdx + sIdx * 5 + 1, faker.number.int({ min: 1, max: 6 }))
    );

    return {
      ...section,
      diggers: diggers.map((digger) => {
        // Hitung totals per digger
        const totals = timeColumns.reduce((acc, time) => {
          acc[time] = digger.trucks.reduce((sum, t) => sum + t[time], 0);
          return acc;
        }, {});

        return {
          ...digger,
          ...totals,
          totalVolume: digger.trucks.reduce((sum, t) => {
            return sum + timeColumns.reduce((s, tm) => s + t[tm], 0);
          }, 0),
          totalDistance: digger.trucks[0]?.distance || 0,
        };
      }),
    };
  });
};
