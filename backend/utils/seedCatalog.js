/**
 * File: utils/seedCatalog.js
 * Purpose: Populates the database with default skills and wilayas on first run.
 * Called automatically from server.js after DB connects.
 * Uses insertMany with { ordered: false } to skip duplicates safely.
 */

const Skill  = require('../models/Skill');
const Wilaya = require('../models/Wilaya');

const DEFAULT_SKILLS = [
  { name: 'React',        category: 'Frontend'  },
  { name: 'Vue.js',       category: 'Frontend'  },
  { name: 'Angular',      category: 'Frontend'  },
  { name: 'Next.js',      category: 'Frontend'  },
  { name: 'Node.js',      category: 'Backend'   },
  { name: 'Express',      category: 'Backend'   },
  { name: 'Django',       category: 'Backend'   },
  { name: 'FastAPI',      category: 'Backend'   },
  { name: 'Laravel',      category: 'Backend'   },
  { name: 'Spring Boot',  category: 'Backend'   },
  { name: 'Python',       category: 'Language'  },
  { name: 'Java',         category: 'Language'  },
  { name: 'JavaScript',   category: 'Language'  },
  { name: 'TypeScript',   category: 'Language'  },
  { name: 'PHP',          category: 'Language'  },
  { name: 'C++',          category: 'Language'  },
  { name: 'MongoDB',      category: 'Database'  },
  { name: 'PostgreSQL',   category: 'Database'  },
  { name: 'MySQL',        category: 'Database'  },
  { name: 'Firebase',     category: 'Database'  },
  { name: 'Docker',       category: 'DevOps'    },
  { name: 'Git',          category: 'DevOps'    },
  { name: 'Linux',        category: 'DevOps'    },
  { name: 'AWS',          category: 'DevOps'    },
  { name: 'React Native', category: 'Mobile'    },
  { name: 'Flutter',      category: 'Mobile'    },
];

const DEFAULT_WILAYAS = [
  { code: '01', name: 'Adrar'              },
  { code: '02', name: 'Chlef'              },
  { code: '03', name: 'Laghouat'           },
  { code: '04', name: 'Oum El Bouaghi'     },
  { code: '05', name: 'Batna'              },
  { code: '06', name: 'Béjaïa'            },
  { code: '07', name: 'Biskra'             },
  { code: '08', name: 'Béchar'            },
  { code: '09', name: 'Blida'              },
  { code: '10', name: 'Bouira'             },
  { code: '11', name: 'Tamanrasset'        },
  { code: '12', name: 'Tébessa'           },
  { code: '13', name: 'Tlemcen'            },
  { code: '14', name: 'Tiaret'             },
  { code: '15', name: 'Tizi Ouzou'         },
  { code: '16', name: 'Algiers'            },
  { code: '17', name: 'Djelfa'             },
  { code: '18', name: 'Jijel'              },
  { code: '19', name: 'Sétif'             },
  { code: '20', name: 'Saïda'             },
  { code: '21', name: 'Skikda'             },
  { code: '22', name: 'Sidi Bel Abbès'    },
  { code: '23', name: 'Annaba'             },
  { code: '24', name: 'Guelma'             },
  { code: '25', name: 'Constantine'        },
  { code: '26', name: 'Médéa'             },
  { code: '27', name: 'Mostaganem'         },
  { code: '28', name: "M'Sila"            },
  { code: '29', name: 'Mascara'            },
  { code: '30', name: 'Ouargla'            },
  { code: '31', name: 'Oran'               },
  { code: '32', name: 'El Bayadh'          },
  { code: '33', name: 'Illizi'             },
  { code: '34', name: 'Bordj Bou Arréridj'},
  { code: '35', name: 'Boumerdès'         },
  { code: '36', name: 'El Tarf'            },
  { code: '37', name: 'Tindouf'            },
  { code: '38', name: 'Tissemsilt'         },
  { code: '39', name: 'El Oued'            },
  { code: '40', name: 'Khenchela'          },
  { code: '41', name: 'Souk Ahras'         },
  { code: '42', name: 'Tipaza'             },
  { code: '43', name: 'Mila'               },
  { code: '44', name: 'Aïn Defla'         },
  { code: '45', name: 'Naâma'             },
  { code: '46', name: 'Aïn Témouchent'    },
  { code: '47', name: 'Ghardaïa'          },
  { code: '48', name: 'Relizane'           },
];

/**
 * Seeds the database with default skills and wilayas.
 * Skips existing entries (no duplicates).
 */
const seedCatalog = async () => {
  try {
    // Insert skills — ignore duplicate key errors
    await Skill.insertMany(DEFAULT_SKILLS, { ordered: false }).catch(() => {});

    // Insert wilayas — ignore duplicate key errors
    await Wilaya.insertMany(DEFAULT_WILAYAS, { ordered: false }).catch(() => {});

    console.log('✅ Catalog seeded (skills + wilayas)');
  } catch (err) {
    // Errors here are non-fatal — duplicates are fine
    console.log('ℹ️  Catalog already seeded');
  }
};

module.exports = seedCatalog;