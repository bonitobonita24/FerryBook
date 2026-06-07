// ============================================================================
// VESSEL SEAT PLANS
// ----------------------------------------------------------------------------
// Source of truth: ../../../seatplan/OUR LADY OF ST. THERESE.pdf
//                  ../../../seatplan/OUR MOTHER OF PERPETUAL HELP.pdf
//
// Each vessel has four passenger classes (top → bottom of the ship):
//   TE  Tourist Economy   (3rd floor, back area)
//   TA  Tourist Aircon    (3rd floor, front area)
//   E   Economy           (2nd floor)
//   D   De Luxe           (1st floor)
//
// Layout encoding
//   classes[code].rows is an ordered list of rows, BACK-of-vessel first and
//   FRONT-of-vessel last. The seat picker renders the rows top-to-bottom and
//   labels the bottom edge as "FRONT" (bow).
//
//   Each row is an array of "blocks" (groups of contiguous seats with no
//   aisle between them). Blocks within a row are separated by a visual aisle
//   gap. An empty block ([]) represents a missing center column (used for the
//   partial back row of Economy / De Luxe on some vessels).
//
//   Block contents are seat NUMBERS only (no prefix). The full seat label is
//   built by the renderer as `${classCode}-${number}` — e.g. "TE-25", "D-44".
// ============================================================================

export const VESSEL_SEAT_PLANS = {
  'OUR LADY OF ST. THERESE': {
    label: 'Our Lady of St. Therese',
    short: 'St. Therese',
    capacity: 299, // 36 + 55 + 112 + 96
    classes: {
      TE: {
        label: 'Tourist Economy',
        floor: '3rd Floor',
        capacity: 36,
        rows: [
          // back of vessel
          [[91, 90, 89, 88, 87, 86], [85, 84, 83, 82, 81, 80]],
          [[68, 69, 70, 71, 72, 73], [74, 75, 76, 77, 78, 79]],
          [[67, 66, 65, 64, 63, 62], [61, 60, 59, 58, 57, 56]],
          // front of vessel (TE adjoins TA in front)
        ],
      },
      TA: {
        label: 'Tourist Aircon',
        floor: '3rd Floor',
        capacity: 55,
        rows: [
          // back
          [[45, 46, 47], [48, 49, 50, 51, 52], [53, 54, 55]],
          [[44, 43, 42], [41, 40, 39, 38, 37], [36, 35, 34]],
          [[23, 24, 25], [26, 27, 28, 29, 30], [31, 32, 33]],
          [[22, 21, 20], [19, 18, 17, 16, 15], [14, 13, 12]],
          [[1, 2, 3], [4, 5, 6, 7, 8], [9, 10, 11]],
          // front
        ],
      },
      E: {
        label: 'Economy',
        floor: '2nd Floor',
        capacity: 112,
        rows: [
          // back (partial — no right block)
          [[112, 111, 110], [109, 108, 107], []],
          [[93, 94, 95, 96], [97, 98, 99, 100, 101, 102], [103, 104, 105, 106]],
          [[92, 91, 90, 89], [88, 87, 86, 85, 84, 83], [82, 81, 80, 79]],
          [[63, 64, 65, 66, 67], [68, 69, 70, 71, 72, 73], [74, 75, 76, 77, 78]],
          [[62, 61, 60, 59, 58], [57, 56, 55, 54, 53, 52], [51, 50, 49, 48, 47]],
          [[31, 32, 33, 34, 35], [36, 37, 38, 39, 40, 41], [42, 43, 44, 45, 46]],
          [[30, 29, 28, 27, 26], [25, 24, 23, 22, 21, 20], [19, 18, 17, 16, 15]],
          [[1, 2, 3, 4], [5, 6, 7, 8, 9, 10], [11, 12, 13, 14]],
          // front
        ],
      },
      D: {
        label: 'De Luxe',
        floor: '1st Floor',
        capacity: 96,
        rows: [
          // back (single wide block)
          [[96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83]],
          [[71, 72, 73, 74], [75, 76, 77, 78], [79, 80, 81, 82]],
          [[70, 69, 68, 67], [66, 65, 64, 63], [62, 61, 60, 59]],
          [[45, 46], [47, 48, 49], [50, 51, 52, 53], [54, 55, 56, 57], [58]],
          [[44, 43], [42, 41, 40], [39, 38, 37, 36], [35, 34, 33, 32], [31]],
          [[21, 22, 23], [24, 25, 26, 27], [28, 29, 30]],
          [[20, 19, 18], [17, 16, 15, 14], [13, 12, 11]],
          [[1, 2, 3], [4, 5, 6, 7], [8, 9, 10]],
          // front
        ],
      },
    },
  },

  'OUR MOTHER OF PERPETUAL HELP': {
    label: 'Our Mother of Perpetual Help',
    short: 'Perpetual Help',
    capacity: 306, // 65 + 66 + 102 + 73
    classes: {
      TE: {
        label: 'Tourist Economy',
        floor: '3rd Floor',
        capacity: 65,
        rows: [
          // back
          [[53, 54, 55, 56], [57, 58, 59, 60, 61], [62, 63, 64, 65]],
          [[52, 51, 50, 49], [48, 47, 46, 45, 44], [43, 42, 41, 40]],
          [[27, 28, 29, 30], [31, 32, 33, 34, 35], [36, 37, 38, 39]],
          [[26, 25, 24, 23], [22, 21, 20, 19, 18], [17, 16, 15, 14]],
          [[1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13]],
          // front
        ],
      },
      TA: {
        label: 'Tourist Aircon',
        floor: '3rd Floor',
        capacity: 66,
        // TA on Perpetual Help has two split cabins (back) with a back door,
        // joining a wide forward section. Rows 1-6 = upper cabin (3+3 layout),
        // rows 7-9 = forward section (5+5 layout). The renderer draws a thin
        // divider where `divideBefore` is set on a row.
        rows: [
          // back — upper cabin (left | back-door | right)
          [[61, 62, 63], [64, 65, 66]],
          [[60, 59, 58], [57, 56, 55]],
          [[49, 50, 51], [52, 53, 54]],
          [[48, 47, 46], [45, 44, 43]],
          [[37, 38, 39], [40, 41, 42]],
          [[36, 35, 34], [33, 32, 31]],
          // forward section
          [[21, 22, 23, 24, 25], [26, 27, 28, 29, 30]],
          [[20, 19, 18, 17, 16], [15, 14, 13, 12, 11]],
          [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]],
          // front
        ],
        dividers: [6], // draw a divider before row index 6 (cabin → forward)
      },
      E: {
        label: 'Economy',
        floor: '2nd Floor',
        capacity: 102,
        rows: [
          // back
          [[102, 101, 100, 99], [98, 97, 96, 95, 94, 93], [92, 91, 90, 89]],
          [[75, 76, 77, 78], [79, 80, 81, 82, 83, 84], [85, 86, 87, 88]],
          [[74, 73, 72, 71], [70, 69, 68, 67, 66, 65], [64, 63, 62, 61]],
          [[47, 48, 49, 50], [51, 52, 53, 54, 55, 56], [57, 58, 59, 60]],
          [[46, 45, 44, 43], [42, 41, 40, 39, 38, 37], [36, 35, 34, 33]],
          [[19, 20, 21, 22], [23, 24, 25, 26, 27, 28], [29, 30, 31, 32]],
          [[18, 17, 16, 15], [14, 13, 12, 11, 10, 9], [8, 7, 6, 5]],
          // front-corners only
          [[1, 2], [], [3, 4]],
          // front
        ],
      },
      D: {
        label: 'De Luxe',
        floor: '1st Floor',
        capacity: 73,
        rows: [
          // back — partial (no center block)
          [[73, 72, 71, 70], [], [69, 68, 67, 66]],
          [[53, 54, 55, 56], [57, 58, 59, 60, 61], [62, 63, 64, 65]],
          [[52, 51, 50, 49], [48, 47, 46, 45, 44], [43, 42, 41, 40]],
          [[27, 28, 29, 30], [31, 32, 33, 34, 35], [36, 37, 38, 39]],
          [[26, 25, 24, 23], [22, 21, 20, 19, 18], [17, 16, 15, 14]],
          [[1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13]],
          // front
        ],
      },
    },
  },
};

// Convenience: ordered list of class codes (top floor → bottom floor pricing
// is reversed in the catalog — De Luxe is most expensive, Tourist Economy
// cheapest).
export const CLASS_CODES = ['D', 'E', 'TA', 'TE'];

// Default fares (₱). Override per sailing as needed.
export const CLASS_DEFAULT_FARE = {
  D: 850,
  E: 550,
  TA: 450,
  TE: 350,
};

export const CLASS_META = {
  D:  { label: 'De Luxe',         short: 'De Luxe', themeFg: '#A16207', themeBg: '#FEF3C7', floor: '1st Floor', summary: 'Reclining seats, premium cabin' },
  E:  { label: 'Economy',         short: 'Economy', themeFg: '#1E40AF', themeBg: '#DBEAFE', floor: '2nd Floor', summary: 'Standard cabin seating' },
  TA: { label: 'Tourist Aircon',  short: 'Tourist A/C', themeFg: '#FF385C', themeBg: '#FFE5E9', floor: '3rd Floor', summary: 'Air-conditioned tourist cabin' },
  TE: { label: 'Tourist Economy', short: 'Tourist Econ.', themeFg: '#15803D', themeBg: '#DCFCE7', floor: '3rd Floor', summary: 'Open-air tourist seating' },
};

// Helper: flat list of all seat labels for a given vessel + class.
export const seatLabelsForClass = (vesselKey, classCode) => {
  const cls = VESSEL_SEAT_PLANS[vesselKey]?.classes?.[classCode];
  if (!cls) return [];
  const out = [];
  for (const row of cls.rows) {
    for (const block of row) {
      for (const n of block) out.push(`${classCode}-${n}`);
    }
  }
  return out;
};
