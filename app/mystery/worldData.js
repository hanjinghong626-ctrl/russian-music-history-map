// 案中曲 - 开放世界地图数据（360全景版）
// 1881年圣彼得堡 — 冬宫之夜的暗奏

const worldMap = {
  id: "st-petersburg-1881",
  name: "圣彼得堡",
  nameRu: "Санкт-Петербург",
  year: "1881",

  // ===== 四个可探索街区 =====
  districts: [
    {
      id: "nevsky",
      name: "涅瓦大街",
      nameRu: "Невский проспект",
      description: "圣彼得堡最繁华的主干道，音乐学院和书店林立",
      background: "/images/mystery/scenes/scene_nevsky.jpg",
      panorama: "/images/mystery/panoramas/pano_nevsky.jpg",
      scrollWidth: 4000,
      atmosphere: "afternoon",
      weather: "clear",
      music: "busy",
      initialYaw: 0,
      exits: {
        left: "alley",
        right: "riverside"
      },
      buildings: [
        {
          id: "conservatory",
          name: "圣彼得堡音乐学院",
          nameRu: "Консерватория",
          yaw: -60,
          pitch: -5,
          sign: "音乐殿堂",
          icon: "🏛️",
          interior: "/images/mystery/scenes/scene_conservatory.jpg",
          npcInside: "rimsky",
          accessible: true,
          clueItems: [
            {
              id: "rimsky-desk",
              name: "里姆斯基的课桌",
              icon: "📝",
              x: 50, y: 50,
              description: "课桌上摊开着穆索尔斯基《霍万兴那》的原稿和一份配器修改稿并排摆放。修改稿的标题上写着'修订版·里姆斯基-科萨科夫'。",
              isKey: true,
              clue: "里姆斯基正在课堂上公开教授如何'修订'穆索尔斯基的作品——他把修改当成了教学内容。"
            },
            {
              id: "orchestra-score",
              name: "管弦乐总谱",
              icon: "🎼",
              x: 30, y: 40,
              description: "一份《图画展览会》的管弦乐总谱，封面标注'里姆斯基-科萨科夫配器版'。翻开内页，几乎每一页都有大幅改写。",
              isKey: true,
              clue: "《图画展览会》被里姆斯基大规模配器改写，已非穆索尔斯基原意。"
            },
            {
              id: "lesson-notes",
              name: "教学笔记",
              icon: "📖",
              x: 70, y: 55,
              description: "里姆斯基的教学笔记，其中一段写道：'穆索尔斯基的配器技法粗糙，必须系统纠正。这是我的义务。'",
              isKey: false,
              clue: "里姆斯基将修改穆索尔斯基作品视为'义务'，而非选择。"
            }
          ]
        },
        {
          id: "bookshop",
          name: "乐谱书店",
          nameRu: "Нотный магазин",
          yaw: 20,
          pitch: -8,
          sign: "乐谱与文献",
          icon: "📚",
          interior: "/images/mystery/scenes/scene_apartment.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "stasov-article",
              name: "斯塔索夫的旧文",
              icon: "📰",
              x: 45, y: 50,
              description: "一本旧杂志，翻到斯塔索夫的文章《论俄罗斯音乐之魂——致穆索尔斯基》：'有人以完善之名行篡改之实，这是对天才最大的不敬。'",
              isKey: false,
              clue: "斯塔索夫公开发文批评里姆斯基对穆索尔斯基作品的修改。"
            },
            {
              id: "cui-review",
              name: "居伊的乐评",
              icon: "✍️",
              x: 65, y: 42,
              description: "居伊撰写的一篇乐评，评论穆索尔斯基作品：'那种粗糙里有一种生命力，是精致永远替代不了的。'旁边有里姆斯基用铅笔画的问号。",
              isKey: true,
              clue: "居伊公开称赞穆索尔斯基的原创性，里姆斯基对此表示不满——铅笔问号暴露了他的态度。"
            }
          ]
        },
        {
          id: "cafe",
          name: "文学咖啡馆",
          nameRu: "Литературное кафе",
          yaw: 80,
          pitch: -5,
          sign: "咖啡与思想",
          icon: "☕",
          interior: "/images/mystery/scenes/scene_tavern.jpg",
          npcInside: "cui",
          accessible: true,
          clueItems: [
            {
              id: "cafe-gossip",
              name: "侍者的耳语",
              icon: "🤫",
              x: 40, y: 60,
              description: "侍者悄悄告诉你：'里姆斯基教授上周在这里跟人争论，说穆索尔斯基的作品如果不经他修改，根本就不该上演。他越说越激动，摔了咖啡杯。'",
              isKey: true,
              clue: "里姆斯基公开主张：未经他修改的穆索尔斯基作品'不该上演'——这是对原作者的否定。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "cui",
          name: "居伊",
          nameRu: "Ц. А. Кюи",
          portrait: "/images/mystery/portraits/portrait_cui.jpg",
          yaw: 85,
          pitch: -5,
          location: "在咖啡馆门口",
          greeting: "哦？一位调查员？我正好写完一篇乐评。你想聊聊穆索尔斯基的事？"
        }
      ]
    },
    {
      id: "riverside",
      name: "河畔区",
      nameRu: "Набережная",
      description: "涅瓦河畔，冬宫倒影，黄昏壮丽",
      background: "/images/mystery/scenes/scene_riverside.jpg",
      panorama: "/images/mystery/panoramas/pano_riverside.jpg",
      scrollWidth: 4000,
      atmosphere: "dusk",
      weather: "clear",
      music: "melancholy",
      initialYaw: 0,
      exits: {
        left: "nevsky",
        right: "park"
      },
      buildings: [
        {
          id: "winter-palace",
          name: "冬宫外观",
          nameRu: "Зимний дворец",
          yaw: -70,
          pitch: 0,
          sign: "帝国之巅",
          icon: "🏰",
          interior: "/images/mystery/scenes/scene_conservatory.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "palace-document",
              name: "宫廷演出记录",
              icon: "📜",
              x: 50, y: 50,
              description: "一份宫廷演出安排的副本，上面记录着：'《霍万兴那》——里姆斯基-科萨科夫修订版，宫廷批准上演。原版：不予演出。'",
              isKey: true,
              clue: "宫廷只批准里姆斯基修订版上演，穆索尔斯基原版被明确禁止——里姆斯基的修改成了官方认可的'唯一版本'。"
            }
          ]
        },
        {
          id: "dock",
          name: "码头仓库",
          nameRu: "Причал",
          yaw: 10,
          pitch: -5,
          sign: "货物与秘密",
          icon: "⚓",
          interior: "/images/mystery/scenes/scene_apartment.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "shipment-box",
              name: "可疑的木箱",
              icon: "📦",
              x: 45, y: 55,
              description: "一个贴着'音乐学院·里姆斯基教授收'标签的木箱，里面装着穆索尔斯基的原始手稿，被随意堆放在箱底，上面压着里姆斯基的配器草稿。",
              isKey: true,
              clue: "穆索尔斯基的原始手稿被当作'原材料'随意装箱——在里姆斯基眼中，它们只是修改的底本。"
            }
          ]
        },
        {
          id: "riverside-bench",
          name: "河畔长椅",
          nameRu: "Скамья у реки",
          yaw: 60,
          pitch: -5,
          sign: "独白与秘密",
          icon: "🪑",
          interior: "/images/mystery/scenes/scene_park.jpg",
          npcInside: "stasov",
          accessible: true,
          clueItems: [
            {
              id: "riverside-note",
              name: "河边的纸条",
              icon: "📄",
              x: 55, y: 65,
              description: "一张被风吹到长椅下的纸条，上面写着：'原版配器绝非缺陷，而是有意为之。证据就在对比之中。——V'",
              isKey: false,
              clue: "署名V的纸条——很可能出自斯塔索夫(Владимир)，他在秘密收集证据。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "stasov",
          name: "斯塔索夫",
          nameRu: "В. В. Стасов",
          portrait: "/images/mystery/portraits/portrait_stasov.jpg",
          yaw: 65,
          pitch: -5,
          location: "坐在河畔长椅旁",
          greeting: "你终于来了。我已经等了很久——穆索尔斯基的死不是简单的病逝，你最好仔细查。"
        }
      ]
    },
    {
      id: "alley",
      name: "旧巷区",
      nameRu: "Переулки",
      description: "窄巷深处，穆索尔斯基的寓所和街角酒馆",
      background: "/images/mystery/scenes/scene_alley.jpg",
      panorama: "/images/mystery/panoramas/pano_alley.jpg",
      scrollWidth: 4000,
      atmosphere: "night",
      weather: "fog",
      music: "tense",
      initialYaw: 0,
      exits: {
        left: "park",
        right: "nevsky"
      },
      buildings: [
        {
          id: "musorgsky-apt",
          name: "穆索尔斯基的寓所",
          nameRu: "Квартира Мусоргского",
          yaw: -50,
          pitch: -10,
          sign: "阁楼 · 第三层",
          icon: "🏚️",
          interior: "/images/mystery/scenes/scene_apartment.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "manuscript",
              name: "散落的手稿",
              icon: "🎼",
              x: 30, y: 45,
              description: "《霍万兴那》的配器手稿，上面有两种不同的笔迹。原稿用深棕色墨水，修改处用蓝色铅笔，覆盖了原稿的大段内容。",
              isKey: true,
              clue: "手稿上有大量蓝色铅笔修改痕迹，修改者的笔迹工整精确——这不是穆索尔斯基的风格。"
            },
            {
              id: "letter",
              name: "未寄出的信",
              icon: "✉️",
              x: 65, y: 55,
              description: "一封写给里姆斯基的信，字迹颤抖：'亲爱的尼古拉，我求你，不要再改我的谱子了。那些修改不是我的声音……'",
              isKey: true,
              clue: "穆索尔斯基曾明确请求里姆斯基停止修改他的作品，但显然没有得到尊重。"
            },
            {
              id: "candle",
              name: "半截蜡烛",
              icon: "🕯️",
              x: 45, y: 60,
              description: "一根快要燃尽的蜡烛，蜡油滴落在桌面上，旁边有一个蓝色墨水瓶，瓶身有指纹。",
              isKey: false,
              clue: "有人在这里待到深夜，使用了蓝色墨水——修改手稿的人可能深夜来过。"
            }
          ]
        },
        {
          id: "tavern",
          name: "街角酒馆",
          nameRu: "Трактир",
          yaw: 30,
          pitch: -5,
          sign: "伏特加与秘密",
          icon: "🍺",
          interior: "/images/mystery/scenes/scene_tavern.jpg",
          npcInside: "borodin",
          accessible: true,
          clueItems: [
            {
              id: "tavern-match",
              name: "火柴盒",
              icon: "🔥",
              x: 35, y: 55,
              description: "一个写着'音乐学院专用'的火柴盒，和穆索尔斯基寓所里找到的蜡烛放在一起看——有人从音乐学院来过这里。",
              isKey: false,
              clue: "音乐学院专用的火柴盒出现在酒馆——音乐学院的某人来过这里。"
            },
            {
              id: "tavern-overheard",
              name: "酒客的闲谈",
              icon: "🗣️",
              x: 60, y: 45,
              description: "邻桌的酒客在低声议论：'听说那个教授又去穆索尔斯基家了，每次都带走一叠谱子。说是帮他整理，谁知道是不是……'",
              isKey: true,
              clue: "里姆斯基频繁去穆索尔斯基住处并带走乐谱——'整理'只是表面说法。"
            }
          ]
        },
        {
          id: "basement",
          name: "地下室",
          nameRu: "Подвал",
          yaw: 90,
          pitch: -15,
          sign: "🔒 需要钥匙",
          icon: "🗝️",
          interior: "/images/mystery/scenes/scene_apartment.jpg",
          npcInside: null,
          accessible: false,
          lockedReason: "铁门紧锁。也许穆索尔斯基寓所里有钥匙……",
          clueItems: [
            {
              id: "basement-letter",
              name: "地下室的密信",
              icon: "📨",
              x: 40, y: 50,
              description: "一封藏在暗格里的信，是里姆斯基写给出版商的：'穆索尔斯基的原稿我已经整理完毕，将以修订版出版。原稿……可以封存了。'",
              isKey: true,
              clue: "里姆斯基计划以修订版替换原版出版，并要求'封存'原稿——这是对原始创作意图的系统性抹除。"
            },
            {
              id: "basement-ink",
              name: "丢弃的墨水瓶",
              icon: "🖋️",
              x: 55, y: 60,
              description: "一个被摔碎的墨水瓶，蓝色墨水洒了一地。跟穆索尔斯基公寓里手稿上的蓝色铅笔修改痕迹颜色一致。",
              isKey: true,
              clue: "蓝色墨水的颜色与穆索尔斯基手稿上的修改痕迹一致——修改者曾在此活动。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "balakirev",
          name: "巴拉基列夫",
          nameRu: "М. А. Балакирев",
          portrait: "/images/mystery/portraits/portrait_balakirev.jpg",
          yaw: -10,
          pitch: -5,
          location: "在巷口徘徊",
          greeting: "……你是什么人？如果是来打听穆索尔斯基的事，我倒是可以告诉你一些东西。"
        }
      ]
    },
    {
      id: "park",
      name: "公园区",
      nameRu: "Сад",
      description: "晨雾中的花园、湖畔和雕像群",
      background: "/images/mystery/scenes/scene_park.jpg",
      panorama: "/images/mystery/panoramas/pano_park.jpg",
      scrollWidth: 4000,
      atmosphere: "dawn",
      weather: "fog",
      music: "mystery",
      initialYaw: 0,
      exits: {
        left: "riverside",
        right: "alley"
      },
      buildings: [
        {
          id: "gazebo",
          name: "湖畔凉亭",
          nameRu: "Беседка",
          yaw: -40,
          pitch: -5,
          sign: "秘密会面",
          icon: "🏯",
          interior: "/images/mystery/scenes/scene_park.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "gazebo-letter",
              name: "凉亭密信",
              icon: "💌",
              x: 50, y: 50,
              description: "一封藏在凉亭座椅下的密信，上面写着：'修订版已获宫廷批准。原版将不再上演。——N.R-K'笔迹与里姆斯基的完全一致。",
              isKey: true,
              clue: "里姆斯基在密信中确认：修订版已获宫廷批准，原版将被封杀——这是一场精心策划的替换。"
            }
          ]
        },
        {
          id: "lakeside",
          name: "湖畔小径",
          nameRu: "Озёрная тропа",
          yaw: 30,
          pitch: -10,
          sign: "水面倒影",
          icon: "🌊",
          interior: "/images/mystery/scenes/scene_park.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "discarded-ink",
              name: "丢弃的墨水瓶",
              icon: "🖋️",
              x: 55, y: 60,
              description: "一个被摔碎的墨水瓶，蓝色墨水洒了一地。跟穆索尔斯基公寓里手稿上的蓝色铅笔修改痕迹颜色一致。",
              isKey: true,
              clue: "蓝色墨水的颜色与穆索尔斯基手稿上的修改痕迹一致——修改者曾在此活动。"
            }
          ]
        },
        {
          id: "statue-garden",
          name: "雕像群",
          nameRu: "Скульптуры",
          yaw: 80,
          pitch: -5,
          sign: "凝固的证人",
          icon: "🗿",
          interior: "/images/mystery/scenes/scene_park.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "statue-engraving",
              name: "雕像底座刻字",
              icon: "🔍",
              x: 50, y: 70,
              description: "一座维纳斯雕像的底座上被人用小刀刻了一行字：'谁控制了配器，谁就控制了灵魂。——N.R-K'",
              isKey: true,
              clue: "'N.R-K'——尼古拉·里姆斯基-科萨科夫（Николай Римский-Корсаков）的缩写。他自己写下了这句令人不寒而栗的话。"
            }
          ]
        }
      ],
      npcs: []
    }
  ],

  // 获取某个街区的数据
  getDistrict(id) {
    return this.districts.find(d => d.id === id);
  },

  // NPC详细对话数据
  characters: {
    rimsky: {
      name: "里姆斯基-科萨科夫",
      nameRu: "Н. А. Римский-Корсаков",
      portrait: "/images/mystery/portraits/portrait_rimsky.jpg",
      location: "音乐学院·教授办公室",
      district: "nevsky",
      buildingId: "conservatory",
      isCulprit: true,
      dialogues: {
        round1: [
          {
            question: "案发当晚你在哪里？",
            answer: "我……那晚我在家中整理乐谱。穆索尔斯基的《霍万兴那》——他走后留下的手稿太乱了，我在帮他誊清。这有什么问题吗？",
            hint: "犹豫后辩解"
          },
          {
            question: "你和受害者最近关系如何？",
            answer: "我们是多年的朋友，强力集团的同伴。我当然关心他——所以我才替他整理遗作啊！你难道觉得这有什么不对？",
            hint: "过度辩解"
          },
          {
            question: "你觉得谁最有嫌疑？",
            answer: "巴拉基列夫吧。他这些年对穆索尔斯基越来越冷淡，早就不像从前那样支持他了。而且……你不觉得他控制欲太强了吗？",
            hint: "转移视线"
          }
        ],
        round2: [
          {
            question: "你修改穆索尔斯基的作品，是修饰还是改写？",
            answer: "只是……小范围的调整。配器上的一些修正，让作品更完整。他的天才毋庸置疑，但技法上确实——我是在帮他啊！",
            hint: "否认改写实质"
          },
          {
            question: "鲍罗丁说那天看见你从穆索尔斯基住处离开？",
            answer: "那……那是因为我去探望他！他病得很重，我只是去送药。你总不能因为探望朋友就变成嫌疑人吧？",
            hint: "紧张、被动"
          },
          {
            question: "穆索尔斯基临终前对你说过什么？",
            answer: "他……他说了很多胡话。烧得神志不清。我记不清了。大概是说……让我别改他的谱子？那一定是谵妄之语。",
            hint: "回避关键信息"
          }
        ],
        round3: [
          {
            question: "你在他的原稿上到底改了多少？",
            answer: "……我只是想让他的作品被演奏！如果没有人修改配器，谁会演《霍万兴那》？谁会演《图画展览会》？原稿太过粗糙，我别无选择！",
            hint: "终于承认改写规模"
          },
          {
            question: "如果穆索尔斯基还活着，他会同意你的修改吗？",
            answer: "他不会同意的……但那又怎样？他已经不在了！如果我不动手，这些作品就会随他一起腐烂！我做的是保存，不是毁灭！",
            hint: "矛盾暴露"
          },
          {
            question: "最后一问：你是在挽救他的音乐，还是在抹杀他的灵魂？",
            answer: "我……（沉默良久）也许……两者之间的界限，我从没分清过。",
            hint: "真凶动摇"
          }
        ]
      }
    },
    balakirev: {
      name: "巴拉基列夫",
      nameRu: "М. А. Балакирев",
      portrait: "/images/mystery/portraits/portrait_balakirev.jpg",
      location: "公寓楼下",
      district: "alley",
      isCulprit: false,
      dialogues: {
        round1: [
          {
            question: "案发当晚你在哪里？",
            answer: "在家弹琴。我现在基本不社交了。自从从宫廷乐师的位置上退下来，我更愿意一个人待着。",
            hint: "平静坦然"
          },
          {
            question: "你和穆索尔斯基最近关系如何？",
            answer: "我们很久没见了。老实说，他后来走的方向让我不太满意——太随意，太缺乏结构。但我从没否认他的才华。",
            hint: "坦诚但冷淡"
          },
          {
            question: "你觉得谁最有嫌疑？",
            answer: "里姆斯基。他总是以'帮助'的名义修改别人的作品。穆索尔斯基活着的时候他就已经开始动手了。你要注意他说的'整理'——那根本不是整理。",
            hint: "指向真凶"
          }
        ],
        round2: [
          {
            question: "有人说你控制欲很强，曾经操控穆索尔斯基的创作？",
            answer: "那是早年的事了。我当时确实……过于强势。但穆索尔斯基最终走出了自己的路，我反而因此和他疏远了。我没有资格操控他，也从未想过害他。",
            hint: "承认过错但坦诚"
          },
          {
            question: "你和穆索尔斯基之间有没有不可调和的矛盾？",
            answer: "音乐理念上的分歧，算不上不可调和。真正让穆索尔斯基痛苦的不是我——是里姆斯基那双'修改之手'。",
            hint: "再次指向真凶"
          },
          {
            question: "你知道穆索尔斯基临终前的状态吗？",
            answer: "据说他烧得厉害，一直在喊'别碰我的谱子'。这话是说给谁听的，你自己想想。",
            hint: "关键证人"
          }
        ],
        round3: [
          {
            question: "你为什么退出强力集团？",
            answer: "我没有退出，是强力集团自己散了。鲍罗丁忙着做化学实验，居伊只写评论，穆索尔斯基醉生梦死，里姆斯基忙着'修改'所有人……初衷早就没了。",
            hint: "无奈但清醒"
          },
          {
            question: "你认为里姆斯基的修改是在犯罪吗？",
            answer: "如果他是在穆索尔斯基活着的时候偷偷改，那是背叛。如果是在死后光明正大地改——那是对亡者的不敬。你怎么定义，随你。",
            hint: "理性分析"
          },
          {
            question: "你对穆索尔斯基的才华怎么看？",
            answer: "他是我们中最有天赋的。也是最不幸的。如果他能多活十年，如果有人真正支持他而不是'修改'他……算了，说这些没用了。",
            hint: "真情感慨"
          }
        ]
      }
    },
    cui: {
      name: "居伊",
      nameRu: "Ц. А. Кюи",
      portrait: "/images/mystery/portraits/portrait_cui.jpg",
      location: "文学咖啡馆",
      district: "nevsky",
      buildingId: "cafe",
      isCulprit: false,
      dialogues: {
        round1: [
          {
            question: "案发当晚你在哪里？",
            answer: "在家写乐评。我刚听完一场演出，正在赶稿子。你可以去报社核实我的截稿时间。",
            hint: "有不在场证明"
          },
          {
            question: "你和穆索尔斯基关系如何？",
            answer: "怎么说呢，我们不是一个层面的人。他是天才，我是匠人。我从不嫉妒他——因为我清楚自己的位置。但里姆斯基不一样，他总觉得自己比穆索尔斯基'更懂音乐'。",
            hint: "暗示里姆斯基动机"
          },
          {
            question: "你觉得谁最有嫌疑？",
            answer: "我没有特别怀疑谁。但如果你要我指一个——那个总说'我在帮他整理'的人，你最好仔细查查他'整理'了什么。",
            hint: "温和指向真凶"
          }
        ],
        round2: [
          {
            question: "作为评论家，你如何评价里姆斯基对穆索尔斯基作品的'修订'？",
            answer: "我写过——穆索尔斯基的原创性是里姆斯基的配器学无法覆盖的。那种粗糙里有一种生命力，是'精致'永远替代不了的。",
            hint: "专业判断"
          },
          {
            question: "强力集团内部有没有秘密？",
            answer: "没有秘密，只有各怀心思。斯塔索夫在外面造势，巴拉基列夫想当领袖，我负责写文章，鲍罗丁负责当老好人……而穆索尔斯基，他只是想写音乐。可惜没有人让他安静地写。",
            hint: "揭露群体动态"
          },
          {
            question: "你有没有见过穆索尔斯基被修改后的手稿？",
            answer: "见过。《霍万兴那》的配器被里姆斯基重写了一大半。穆索尔斯基自己写的那部分——粗糙但直击灵魂。里姆斯基加的部分——精致但空洞。你一对比就知道问题在哪。",
            hint: "关键证据线索"
          }
        ],
        round3: [
          {
            question: "你觉得穆索尔斯基的死是意外还是有人加速了他的消亡？",
            answer: "身体上，是酒精和贫困杀了他。但精神上——一个人如果知道自己的作品被'好心人'改得面目全非，那种绝望比酒精更致命。",
            hint: "深度分析"
          },
          {
            question: "如果里姆斯基没有修改穆索尔斯基的作品，历史会怎样？",
            answer: "也许穆索尔斯基的作品要更晚才被人发现。但至少，被发现的会是真正的穆索尔斯基，而不是一个'里姆斯基化的穆索尔斯基'。",
            hint: "哲学追问"
          },
          {
            question: "最后一个问题——你对这个案件有什么想说的？",
            answer: "在俄罗斯音乐史上，'帮助'有时候是最残忍的武器。查查谁在'帮助'他吧。",
            hint: "最终指向"
          }
        ]
      }
    },
    borodin: {
      name: "鲍罗丁",
      nameRu: "А. П. Бородин",
      portrait: "/images/mystery/portraits/portrait_borodin.jpg",
      location: "街角酒馆",
      district: "alley",
      buildingId: "tavern",
      isCulprit: false,
      dialogues: {
        round1: [
          {
            question: "案发当晚你在哪里？",
            answer: "在实验室做实验！你知道的，我白天是化学教授，作曲只是业余。那晚我有一个醛类的实验跑到了深夜。",
            hint: "有不在场证明"
          },
          {
            question: "你和穆索尔斯基关系如何？",
            answer: "我们是好朋友！穆索尔斯基是真正的天才，虽然他的生活方式让我很担心。我劝过他少喝酒，但他不听……唉。",
            hint: "真诚关心"
          },
          {
            question: "你觉得谁最有嫌疑？",
            answer: "我不想怀疑任何人……但那天傍晚我经过穆索尔斯基住处时，确实看见里姆斯基从里面出来。他的表情很奇怪，像是做了什么决定似的。",
            hint: "目击证人"
          }
        ],
        round2: [
          {
            question: "你能描述一下里姆斯基当时的表情吗？",
            answer: "怎么说呢……坚定但又不自然？像是一个人说服自己做了正确的事，但内心深处知道不是那么回事。手里还抱着一叠乐谱。",
            hint: "关键目击"
          },
          {
            question: "穆索尔斯基有没有跟你抱怨过里姆斯基？",
            answer: "他提过几次，说里姆斯基总是想'完善'他的作品。他说：'我的音乐就像我的脸，不好看但真实。他非要给我的脸化妆，妆越化越精致，但那还是我吗？'",
            hint: "受害者原话"
          },
          {
            question: "你知道穆索尔斯基的手稿现在在哪里吗？",
            answer: "应该在里姆斯基那里。穆索尔斯基去世后，他的遗物就被里姆斯基'接管'了。说是整理出版，但到现在我也没看到原稿……",
            hint: "物证去向"
          }
        ],
        round3: [
          {
            question: "你觉得强力集团的理想实现了吗？",
            answer: "很遗憾，没有。我们本想创造真正俄罗斯的音乐，但最后——穆索尔斯基的作品被'西化'了，巴拉基列夫退缩了，居伊变成了评论机器，我还在实验室里……只有里姆斯基成功了，但那是以牺牲穆索尔斯基为代价的。",
            hint: "悲剧反思"
          },
          {
            question: "你对里姆斯基修改作品这件事怎么看？",
            answer: "我理解他的出发点——没有他的配器，穆索尔斯基的歌剧可能真的无法上演。但……那些'完善'丢掉了最宝贵的东西：穆索尔斯基的灵魂。这才是真正的悲剧。",
            hint: "理性中见悲伤"
          },
          {
            question: "你最后想对调查员说什么？",
            answer: "穆索尔斯基临终前一直在喊：'别碰我的谱子！别碰我的谱子！'——看看是谁没听他的话。",
            hint: "关键证言"
          }
        ]
      }
    },
    stasov: {
      name: "斯塔索夫",
      nameRu: "В. В. Стасов",
      portrait: "/images/mystery/portraits/portrait_stasov.jpg",
      location: "涅瓦河畔",
      district: "riverside",
      buildingId: "riverside-bench",
      isCulprit: false,
      dialogues: {
        round1: [
          {
            question: "案发当晚你在哪里？",
            answer: "在帝国公共图书馆。我每天都在那里工作到很晚，整理斯拉夫艺术文献。你可以问图书馆管理员。",
            hint: "有不在场证明"
          },
          {
            question: "你和穆索尔斯基关系如何？",
            answer: "我一手发掘了他！当年是我在信中鼓励他走上音乐之路，是我帮他构思了《鲍里斯·戈杜诺夫》的主题。他就像我的孩子。",
            hint: "自认导师"
          },
          {
            question: "你觉得谁最有嫌疑？",
            answer: "这还用问？里姆斯基-科萨科夫！他打着'完善'的旗号，实则是在谋杀穆索尔斯基的音乐灵魂。他修改《霍万兴那》的手法，简直比沙皇审查还狠！",
            hint: "直接指控真凶"
          }
        ],
        round2: [
          {
            question: "你说里姆斯基'比沙皇审查还狠'，能具体说明吗？",
            answer: "沙皇审查是删减——粗暴但看得见。里姆斯基是替换——把穆索尔斯基的配器整段整段换成他自己的，表面上更'好听'了，但穆索尔斯基的声音消失了。这比删减更阴险！",
            hint: "专业分析"
          },
          {
            question: "你对穆索尔斯基最后几年的生活了解多少？",
            answer: "很惨。贫穷、酗酒、被边缘化。最讽刺的是——他死后反而'出名'了，因为里姆斯基修改后的版本被演出了。但那还是他的音乐吗？那是里姆斯基穿上了穆索尔斯基的皮！",
            hint: "愤怒但洞察"
          },
          {
            question: "有没有什么文件能证明里姆斯基大规模修改了原稿？",
            answer: "里姆斯基自己就在文章里写过！他公开说穆索尔斯基的配器'不够专业'，需要'纠正'。白纸黑字，他自己都承认了，只是他不认为这是问题。",
            hint: "文献证据"
          }
        ],
        round3: [
          {
            question: "你为什么如此愤怒？",
            answer: "因为穆索尔斯基活着的时候无人问津，死后却被'好心人'肢解重组！他的天才被当作病态，他的原创被当作缺陷。如果这不是谋杀，什么是？",
            hint: "义愤填膺"
          },
          {
            question: "你有没有可能夸大了事实？",
            answer: "你去听听原版和修订版的对比就知道了。《霍万兴那》的序幕，穆索尔斯基原版的管弦乐有种黎明前黑暗中的厚重感——里姆斯基把它改成了光鲜的歌剧序曲。灵魂没了，只剩技法。",
            hint: "音乐分析"
          },
          {
            question: "最后一个问题——你怎么看这个案件？",
            answer: "这不是普通的案件。这是一个天才被'爱'杀死的案件。里姆斯基真心觉得自己在帮忙——这才是最可怕的。",
            hint: "点明主题"
          }
        ]
      }
    }
  },

  // 地下室解锁条件
  unlockConditions: {
    basement: {
      requiredClues: ["manuscript", "letter"],
      message: "你用穆索尔斯基公寓里找到的钥匙打开了地下室的铁门……"
    }
  },

  // 案件结论
  caseResult: {
    culprit: "rimsky",
    victimName: "穆索尔斯基",
    victimPortrait: "/images/mystery/portraits/portrait_musorgsky.jpg",
    culpritName: "里姆斯基-科萨科夫",
    culpritPortrait: "/images/mystery/portraits/portrait_rimsky.jpg",
    truth: "里姆斯基-科萨科夫'谋杀'了穆索尔斯基的音乐灵魂。\n\n他真心认为自己在'拯救'穆索尔斯基的作品——没有精良的配器，这些作品就'无法演出'。但这种'拯救'的代价是：穆索尔斯基原创的、粗犷的、直击灵魂的声音乐器法被替换成了里姆斯基式的精致与圆滑。\n\n穆索尔斯基临终前反复呼喊'别碰我的谱子'，但里姆斯基没有听。在他看来，这些话是'病中谵妄'，他的修改才是'理性'的选择。\n\n这或许是音乐史上最温柔的谋杀——凶手真心爱着受害者，却亲手抹去了他最真实的声音。",
    knowledge: [
      {
        title: "穆索尔斯基的配器之争",
        content: "穆索尔斯基的管弦乐写法被同时代人认为'粗糙''不专业'。里姆斯基-科萨科夫对其《霍万兴那》《图画展览会》等作品进行了大规模重新配器。直到20世纪中期，音乐学界才开始重新审视穆索尔斯基原版的价值，发现其'粗糙'中蕴含的独特表现力。",
        source: "音乐学史·俄罗斯民族乐派"
      },
      {
        title: "强力集团的兴衰",
        content: "五人强力集团（Могучая кучка）是19世纪60-70年代俄罗斯最具影响力的音乐创作群体，由巴拉基列夫、穆索尔斯基、里姆斯基-科萨科夫、鲍罗丁和居伊组成。斯塔索夫是他们的理论推手。集团后期因音乐理念分歧而名存实亡。",
        source: "俄罗斯音乐史·民族乐派"
      },
      {
        title: "原版 vs 修订版",
        content: "20世纪80年代，肖斯塔科维奇等人推动恢复了穆索尔斯基作品的原始版本。如今，《霍万兴那》《鲍里斯·戈杜诺夫》等歌剧既有里姆斯基修订版，也有原版上演，两个版本的对比成为音乐学研究的经典课题。",
        source: "歌剧研究·版本比较"
      }
    ]
  }
};

export default worldMap;
