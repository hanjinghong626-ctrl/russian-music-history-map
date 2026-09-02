// 案中曲·第二案 - 莫斯科的回声（Эхо Москвы）
// 1893年莫斯科 — 悲怆之后

const worldMap = {
  id: "moscow-1893",
  name: "莫斯科",
  nameRu: "Москва",
  year: "1893",
  caseTitle: "莫斯科的回声",
  caseTitleRu: "Эхо Москвы",
  caseNumber: 2,

  districts: [
    {
      id: "theater",
      name: "大剧院区",
      nameRu: "Театральная площадь",
      description: "莫斯科大剧院金碧辉煌，芭蕾与歌剧的不夜城",
      background: "/images/mystery2/scenes/scene_theater_district.jpg",
      scrollWidth: 4000,
      atmosphere: "night",
      weather: "clear",
      music: "grand",
      exits: {
        left: "conservatory",
        right: "mansion"
      },
      buildings: [
        {
          id: "bolshoi",
          name: "莫斯科大剧院",
          nameRu: "Большой театр",
          x: 8,
          width: 24,
          sign: "悲怆首演之地",
          icon: "🎭",
          interior: "/images/mystery2/scenes/scene_bolshoi_interior.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "program-note",
              name: "首演节目单",
              icon: "🎫",
              x: 40, y: 45,
              description: "1893年10月28日首演节目单，《第六交响曲「悲怆」》赫然在列。节目单背面有人用铅笔潦草写道：'他指挥完最后一个音时，眼中含泪。从未见他那样的表情。'",
              isKey: true,
              clue: "柴可夫斯基在《悲怆》首演时的异常情绪——他是否预感了什么？"
            },
            {
              id: "conductor-stand",
              name: "指挥台",
              icon: "🎼",
              x: 55, y: 50,
              description: "指挥台上的乐谱仍然翻开在最后一页。乐谱边缘有水渍——是泪水还是汗水，已经分不清了。第三乐章的结尾处，柴可夫斯基用红笔圈了一个词：'悲叹'（LAMENTOSO）。",
              isKey: true,
              clue: "柴可夫斯基在乐谱上特意圈出'悲叹'——这不是普通的音乐标注，而是遗言般的存在。"
            },
            {
              id: "dressing-room-note",
              name: "化妆间纸条",
              icon: "📝",
              x: 70, y: 55,
              description: "一张揉皱的纸条，在化妆间垃圾桶里找到。上面写着：'彼得，别再犹豫了。已经无法回头。——М'",
              isKey: true,
              clue: "署名'М'的纸条在催促柴可夫斯基——这个'М'可能是莫杰斯特（Модест），他弟弟。'无法回头'指的是什么？"
            }
          ]
        },
        {
          id: "backstage",
          name: "大剧院后台",
          nameRu: "За кулисами",
          x: 42,
          width: 16,
          sign: "幕后的秘密",
          icon: "🎪",
          interior: "/images/mystery2/scenes/scene_backstage.jpg",
          npcInside: "rachmaninoff",
          accessible: true,
          clueItems: [
            {
              id: "rachmaninoff-letter",
              name: "拉赫玛尼诺夫的信",
              icon: "✉️",
              x: 50, y: 50,
              description: "一封未寄出的信，拉赫玛尼诺夫的笔迹：'柴可夫斯基听完我弹奏后，握住我的手说——你是未来。然后他的眼神突然黯淡了，仿佛意识到自己已经不属于那个未来。'",
              isKey: false,
              clue: "柴可夫斯基对年轻一代的态度：既祝福又带着某种告别感。"
            },
            {
              id: "stagehand-testimony",
              name: "舞台管理员的日记",
              icon: "📓",
              x: 30, y: 60,
              description: "舞台管理员的日记，10月28日那页写道：'演出结束后，一位穿军装的先生到后台来找柴可夫斯基，两人低声交谈了约十分钟。柴可夫斯基的脸色变得苍白。'",
              isKey: true,
              clue: "首演当晚有军人到后台找柴可夫斯基——他脸色变白，这个人带来了什么消息？"
            }
          ]
        },
        {
          id: "vip-box",
          name: "贵宾包厢",
          nameRu: "Ложа",
          x: 72,
          width: 16,
          sign: "权力与秘密",
          icon: "👑",
          interior: "/images/mystery2/scenes/scene_vip_box.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "court-invitation",
              name: "宫廷请柬",
              icon: "📜",
              x: 45, y: 50,
              description: "一张宫廷请柬，邀请柴可夫斯基在11月6日出席皇室晚宴。请柬左下角有一个暗红色的火漆印，图案是双头鹰。旁边有人写了一行小字：'不接受=不接受活'。",
              isKey: true,
              clue: "宫廷请柬上'不接受=不接受活'的威胁——柴可夫斯基受到了来自权力核心的压力。"
            },
            {
              id: "opera-glasses",
              name: "观剧望远镜",
              icon: "🔭",
              x: 65, y: 42,
              description: "一副精美的观剧望远镜，镜身上刻着'Н.Ф.М'——纳杰日达·冯·梅克（Надежда фон Мекк）。望远镜的皮套里夹着一张旧照片：柴可夫斯基在花园里微笑。",
              isKey: false,
              clue: "冯·梅克夫人虽已与柴可夫斯基断交，但仍保留着他的照片——她的感情并未真正终结。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "rachmaninoff",
          name: "拉赫玛尼诺夫",
          nameRu: "С. В. Рахманинов",
          portrait: "/images/mystery2/portraits/portrait_rachmaninoff.jpg",
          x: 42,
          location: "在大剧院后台",
          greeting: "柴可夫斯基……他最后一次听我弹琴时，目光里有一种我无法理解的东西。现在我终于懂了——那是告别。"
        }
      ]
    },
    {
      id: "conservatory",
      name: "音乐学院区",
      nameRu: "Консерватория",
      description: "莫斯科音乐学院，柴可夫斯基执教二十年的地方",
      background: "/images/mystery2/scenes/scene_conservatory_district.jpg",
      scrollWidth: 4000,
      atmosphere: "dusk",
      weather: "fog",
      music: "solemn",
      exits: {
        left: "riverbank",
        right: "theater"
      },
      buildings: [
        {
          id: "tchaikovsky-office",
          name: "柴可夫斯基的办公室",
          nameRu: "Кабинет Чайковского",
          x: 10,
          width: 20,
          sign: "二十年执教之地",
          icon: "🎹",
          interior: "/images/mystery2/scenes/scene_tchaikovsky_office.jpg",
          npcInside: "taneyev",
          accessible: true,
          clueItems: [
            {
              id: "sixth-symphony-draft",
              name: "第六交响曲草稿",
              icon: "🎼",
              x: 35, y: 45,
              description: "《悲怆》的早期草稿，与最终版本有一个关键区别：草稿中第四乐章的结尾标记是'带着绝望的平静'，而最终版改成了'逐渐消逝如垂死的心跳'。柴可夫斯基在修改处画了一个十字架。",
              isKey: true,
              clue: "柴可夫斯基将交响曲的结尾从'绝望的平静'改为'垂死的心跳'——他在用音乐写自己的死亡预言。"
            },
            {
              id: "secret-diary",
              name: "上锁的日记",
              icon: "🔒",
              x: 70, y: 55,
              description: "一本上锁的日记，锁已被撬开。最后一周的内容令人震惊：'10月25日——我收到了那封信。他们知道了。他们要我做出选择。10月27日——首演必须如期举行。也许这是我能留下的最后声音。10月30日——我选择了……'",
              isKey: true,
              clue: "柴可夫斯基在首演前三天收到了某封信，'他们知道了'——他被威胁了，而首演成了他的'最后声音'。"
            },
            {
              id: "taneyev-letter",
              name: "塔涅耶夫的信",
              icon: "✉️",
              x: 50, y: 40,
              description: "塔涅耶夫写给柴可夫斯基的一封信：'老师，您最近几部作品中和声的走向让我深深忧虑。那不是您一贯的风格——那是告别的和声。如果有任何困扰您的事……'",
              isKey: false,
              clue: "塔涅耶夫从音乐中听出了'告别的和声'——柴可夫斯基的痛苦已深到无法在作品中隐藏。"
            }
          ]
        },
        {
          id: "archive-room",
          name: "档案室",
          nameRu: "Архив",
          x: 45,
          width: 14,
          sign: "尘封的真相",
          icon: "📁",
          interior: "/images/mystery2/scenes/scene_archive.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "court-martial-file",
              name: "军事法庭卷宗",
              icon: "⚖️",
              x: 40, y: 50,
              description: "一份军事法庭的秘密卷宗副本，日期是1893年10月。卷宗提到'对一个知名人士的道德指控'，但具体名字被墨水涂抹。卷宗末尾有一个裁决：'建议当事人自行了断，以保全名誉。'",
              isKey: true,
              clue: "军事法庭秘密裁决建议'自行了断以保全名誉'——这就是柴可夫斯基的'选择'！他不是自然死亡，而是被迫自杀。"
            },
            {
              id: "rubinstein-memo",
              name: "鲁宾斯坦的备忘录",
              icon: "📋",
              x: 60, y: 45,
              description: "鲁宾斯坦的私人备忘录：'柴可夫斯基来找我，说有人要毁掉他。我告诉他——名声比命重要。我也许不该这么说。'",
              isKey: true,
              clue: "鲁宾斯坦承认对柴可夫斯基说过'名声比命重要'——他是推动柴可夫斯基选择自杀的关键人物之一。"
            }
          ]
        },
        {
          id: "practice-room",
          name: "琴房",
          nameRu: "Класс",
          x: 75,
          width: 14,
          sign: "余音未散",
          icon: "🎵",
          interior: "/images/mystery2/scenes/scene_practice_room.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "piano-score",
              name: "钢琴上的总谱",
              icon: "🎹",
              x: 45, y: 55,
              description: "翻开在琴架上的总谱——正是《悲怆》第四乐章。在最后几个小节旁边，柴可夫斯基用俄语写了一行字：'这不是音乐，这是遗嘱。'",
              isKey: true,
              clue: "柴可夫斯基亲笔写下'这不是音乐，这是遗嘱'——《悲怆》是他有意识的告别之作。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "taneyev",
          name: "塔涅耶夫",
          nameRu: "С. И. Танеев",
          portrait: "/images/mystery2/portraits/portrait_taneyev.jpg",
          x: 10,
          location: "在柴可夫斯基的办公室",
          greeting: "老师走了，但他的音乐里藏着答案。你听到了吗？《悲怆》的最后几个小节——那不是终结，那是控诉。"
        }
      ]
    },
    {
      id: "mansion",
      name: "豪宅区",
      nameRu: "Особняки",
      description: "莫斯科河畔的富人宅邸，冯·梅克夫人的领地",
      background: "/images/mystery2/scenes/scene_mansion_district.jpg",
      scrollWidth: 4000,
      atmosphere: "afternoon",
      weather: "clear",
      music: "elegant",
      exits: {
        left: "theater",
        right: "riverbank"
      },
      buildings: [
        {
          id: "von-meck-house",
          name: "冯·梅克夫人宅邸",
          nameRu: "Особняк фон Мекк",
          x: 8,
          width: 22,
          sign: "十四年情书之屋",
          icon: "🏡",
          interior: "/images/mystery2/scenes/scene_von_meck_salon.jpg",
          npcInside: "von-meck",
          accessible: true,
          clueItems: [
            {
              id: "love-letters",
              name: "十四年书信集",
              icon: "💌",
              x: 30, y: 45,
              description: "整整一箱书信——冯·梅克夫人和柴可夫斯基十四年精神恋爱的全部信件。最后一封信的日期是1890年，夫人的笔迹：'我无法再继续了。请原谅我。不是因为你，而是因为我自己的真相。'",
              isKey: true,
              clue: "冯·梅克夫人在1890年突然断绝关系，理由不是柴可夫斯基的问题而是'她自己的真相'——她发现了什么？"
            },
            {
              id: "financial-record",
              name: "财务记录",
              icon: "💰",
              x: 55, y: 50,
              description: "冯·梅克夫人的财务记录显示，她给柴可夫斯基的资助在1890年戛然而止。但在1893年10月——柴可夫斯基死前一个月——有一笔奇怪的支出：'特别用途——5000卢布'，收款人栏是空的。",
              isKey: true,
              clue: "柴可夫斯基死前一个月，冯·梅克夫人有一笔5000卢布的'特别用途'支出——这笔钱去了哪里？"
            },
            {
              id: "portrait-hidden",
              name: "藏起来的画像",
              icon: "🖼️",
              x: 75, y: 55,
              description: "在梳妆台暗格里找到的一幅小型油画：柴可夫斯基的肖像。画框背面写着：'我的灵魂从未离开你。当你的音乐响起，我就在那里。——П'",
              isKey: false,
              clue: "冯·梅克夫人藏起了柴可夫斯基的画像——她的断绝并非出自本意，而是被迫。"
            }
          ]
        },
        {
          id: "salon",
          name: "文学沙龙",
          nameRu: "Салон",
          x: 45,
          width: 16,
          sign: "莫斯科的客厅",
          icon: "🥂",
          interior: "/images/mystery2/scenes/scene_salon.jpg",
          npcInside: "modest",
          accessible: true,
          clueItems: [
            {
              id: "modest-manuscript",
              name: "莫杰斯特的手稿",
              icon: "📖",
              x: 45, y: 50,
              description: "莫杰斯特正在撰写的柴可夫斯基传记手稿。有一整页被涂黑了，但从痕迹中可以辨认出几个词：'……必须保护……真相不能……他的名誉高于一切……'",
              isKey: true,
              clue: "莫杰斯特在传记中刻意删除了某些内容——他在保护'名誉'而非'真相'。他选择了掩盖。"
            },
            {
              id: "telegram",
              name: "电报底稿",
              icon: "📡",
              x: 65, y: 42,
              description: "一份电报底稿，发件人莫杰斯特，收件人不明：'事情已办妥。对外宣称霍乱。请放心。'",
              isKey: true,
              clue: "莫杰斯特的电报明确说'对外宣称霍乱'——柴可夫斯基的死因是被伪造的！"
            }
          ]
        },
        {
          id: "jurgenson-office",
          name: "尤根松出版社",
          nameRu: "Издательство Юргенсона",
          x: 72,
          width: 16,
          sign: "音符与铜板",
          icon: "📑",
          interior: "/images/mystery2/scenes/scene_publisher.jpg",
          npcInside: "jurgenson",
          accessible: true,
          clueItems: [
            {
              id: "contract",
              name: "出版合同",
              icon: "📜",
              x: 45, y: 50,
              description: "柴可夫斯基与尤根松的最新出版合同。附注：'若作者身故，全部版权归出版社独占，为期三十年。'合同签署日期：1893年9月——仅比柴可夫斯基去世早一个月。",
              isKey: true,
              clue: "尤根松在柴可夫斯基死前一个月签下了对他最有利的版权合同——他是受益者之一。"
            },
            {
              id: "correspondence",
              name: "往来信件",
              icon: "📨",
              x: 65, y: 55,
              description: "尤根松与莫杰斯特的往来信件。尤根松写道：'版权事宜一切顺利。版税收入将远超预期——这要归功于「悲怆」的成功。我保证，您兄长的遗产将得到最大程度的价值。'",
              isKey: false,
              clue: "尤根松毫不掩饰地从柴可夫斯基之死中获利——「悲怆」的成功让他赚得盆满钵满。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "modest",
          name: "莫杰斯特·柴可夫斯基",
          nameRu: "М. И. Чайковский",
          portrait: "/images/mystery2/portraits/portrait_modest.jpg",
          x: 45,
          location: "在文学沙龙",
          greeting: "你是来调查我兄长的死因？我可以告诉你一切——但有些真相，说出来比埋葬它更残忍。"
        }
      ]
    },
    {
      id: "riverbank",
      name: "莫斯科河畔",
      nameRu: "Набережная Москвы-реки",
      description: "莫斯科河畔，清晨薄雾，茶馆与墓园",
      background: "/images/mystery2/scenes/scene_riverbank.jpg",
      scrollWidth: 4000,
      atmosphere: "dawn",
      weather: "fog",
      music: "mournful",
      exits: {
        left: "mansion",
        right: "conservatory"
      },
      buildings: [
        {
          id: "teahouse",
          name: "河边茶馆",
          nameRu: "Чайная",
          x: 8,
          width: 16,
          sign: "莫斯科的舌头",
          icon: "🫖",
          interior: "/images/mystery2/scenes/scene_teahouse.jpg",
          npcInside: "rubinstein",
          accessible: true,
          clueItems: [
            {
              id: "gossip-newspaper",
              name: "旧报纸",
              icon: "📰",
              x: 40, y: 55,
              description: "一份莫斯科旧报纸，社交栏写道：'柴可夫斯基先生近日与某军官在涅瓦大街的餐厅共饮生水。据目击者称，当时气温骤降，饮用未煮沸之水实属反常。'",
              isKey: true,
              clue: "柴可夫斯基被目击与军官共饮'生水'——在霍乱肆虐的圣彼得堡喝生水无异于自杀。这是意外，还是有意为之？"
            },
            {
              id: "waiter-testimony",
              name: "侍者的证词",
              icon: "🗣️",
              x: 60, y: 48,
              description: "茶馆侍者说：'柴可夫斯基先生那天来喝茶，但只坐了一刻钟就走了。他接到一张纸条后脸色大变，连茶都没喝就冲出去了。纸条是一个穿军装的人送来的。'",
              isKey: false,
              clue: "又出现了一个送纸条的军人——军人在这件事中扮演了关键角色。"
            }
          ]
        },
        {
          id: "cemetery",
          name: "墓地",
          nameRu: "Кладбище",
          x: 45,
          width: 18,
          sign: "安息与不安",
          icon: "⚰️",
          interior: "/images/mystery2/scenes/scene_cemetery.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "grave-flowers",
              name: "墓前的花",
              icon: "💐",
              x: 45, y: 55,
              description: "柴可夫斯基墓前的花束中有两样东西：一封被雨水浸透的信（无法辨认），和一枚军事勋章。勋章上刻着'帝国荣誉'——但谁会把军事勋章放在音乐家的墓前？",
              isKey: true,
              clue: "军事勋章出现在柴可夫斯基墓前——这是'帝国'在展示它的权威，还是在忏悔它的罪行？"
            },
            {
              id: "death-certificate",
              name: "死亡证明",
              icon: "📋",
              x: 65, y: 48,
              description: "官方死亡证明：死因——霍乱。但证明上的墨水颜色有两种，'霍乱'二字明显是后来替换的——原来的词被刮掉了。",
              isKey: true,
              clue: "死亡证明被篡改！原始死因不是霍乱——是有人改了记录来掩盖真相。"
            }
          ]
        },
        {
          id: "riverside-chapel",
          name: "河畔小教堂",
          nameRu: "Часовня",
          x: 75,
          width: 14,
          sign: "忏悔之门",
          icon: "🕯️",
          interior: "/images/mystery2/scenes/scene_chapel.jpg",
          npcInside: null,
          accessible: true,
          clueItems: [
            {
              id: "confession-record",
              name: "告解记录",
              icon: "✝️",
              x: 50, y: 50,
              description: "教堂的告解记录中有一段被加密的内容，经辨认：'11月1日。有人来告解，说自己犯了大罪——帮助一个人走上了不归路。他说：是那个法庭逼的，不是我。但我递了那杯水。'",
              isKey: true,
              clue: "告解记录揭露：有人'递了那杯水'——柴可夫斯基喝的那杯'致命生水'是有人故意递给他的！军事法庭的裁决是通过他人之手执行的。"
            }
          ]
        }
      ],
      npcs: [
        {
          id: "rubinstein",
          name: "鲁宾斯坦",
          nameRu: "А. Г. Рубинштейн",
          portrait: "/images/mystery2/portraits/portrait_rubinstein.jpg",
          x: 8,
          location: "在河边茶馆",
          greeting: "柴可夫斯基……我们之间有过恩怨，但他不该那样死去。不管官方怎么说——那杯水不是意外。"
        }
      ]
    }
  ],

  getDistrict(id) {
    return this.districts.find(d => d.id === id);
  },

  characters: {
    modest: {
      name: "莫杰斯特·柴可夫斯基",
      nameRu: "М. И. Чайковский",
      portrait: "/images/mystery2/portraits/portrait_modest.jpg",
      location: "文学沙龙",
      district: "mansion",
      buildingId: "salon",
      isCulprit: false,
      isProtector: true,
      dialogues: {
        round1: [
          { question: "你兄长去世时你在哪里？", answer: "我就在他身边。彼得病倒后我一直守着——从发病到……结束。霍乱来得太快了。三天，仅仅三天。", hint: "陈述流畅但回避细节" },
          { question: "你认为你兄长的死是意外吗？", answer: "当然。1893年圣彼得堡霍乱流行，彼得喝了生水……这是悲剧，但不是阴谋。你不会真信那些谣传吧？", hint: "急于否认" },
          { question: "你兄长临终前说了什么？", answer: "他……说了很多胡话。发烧烧到神志不清。我只记得他反复说——'我的音乐……不要改……不要改……'", hint: "停顿后回避" }
        ],
        round2: [
          { question: "有人说柴可夫斯基的死因不是霍乱，你做何回应？", answer: "那是恶意中伤！我亲眼看着他的症状——上吐下泻、脱水、肾衰竭——这就是霍乱！我比任何人都希望他活着，你以为我不痛苦吗？", hint: "过度辩解，情绪激动" },
          { question: "你在兄长去世前一个月签了什么文件？", answer: "……你怎么知道的？那只是一些版权事务的委托书。兄长去世后总得有人处理遗产，这很正常。", hint: "被戳中软肋" },
          { question: "你发电报说'对外宣称霍乱'，是什么意思？", answer: "你……你看到了那份电报？那是——那是断章取义！我是在跟医生讨论死因的措辞，霍乱的医学证明没有问题！", hint: "惊慌失措" }
        ],
        round3: [
          { question: "你到底在保护什么——真相，还是你兄长的名誉？", answer: "……（沉默很久）你以为我不痛苦吗？我知道真相。但真相会毁掉他的一切——他的音乐、他的遗产、他在世人心中的形象。你是要我亲手毁掉兄长留下的一切吗？", hint: "痛苦地承认在隐瞒" },
          { question: "你兄长是否被强迫做出'选择'？", answer: "他不是被强迫的……他是自愿的。他说——'与其名誉尽毁，不如让音乐替我说话。'他选择了音乐，而不是自己。", hint: "真相浮现" },
          { question: "最后一问：如果让你重来，你会让他选择真相吗？", answer: "我不知道。我真的不知道。我只知道——兄长写的每一个音符都在哭泣。如果你仔细听《悲怆》，你会听到他真正想说的话。那不是交响曲，那是遗书。", hint: "崩溃" }
        ]
      }
    },
    "von-meck": {
      name: "冯·梅克夫人",
      nameRu: "Н. Ф. фон Мекк",
      portrait: "/images/mystery2/portraits/portrait_von_meck.jpg",
      location: "自家宅邸",
      district: "mansion",
      buildingId: "von-meck-house",
      isCulprit: false,
      isProtector: true,
      dialogues: {
        round1: [
          { question: "你为什么在1890年与柴可夫斯基断绝了一切联系？", answer: "那是我的个人决定，与任何人无关。我经济状况恶化，无法继续资助——仅此而已。", hint: "官方说辞，表情僵硬" },
          { question: "你和柴可夫斯基十四年从未见面，这是真的吗？", answer: "真的。我们约定永不见面——这是我们的契约。我只通过信件和音乐了解他，而他也只通过文字认识我。也许……这才是最纯粹的爱。", hint: "真情流露" },
          { question: "你觉得柴可夫斯基的死可疑吗？", answer: "可疑？我不这么认为。但我不相信那是简单的意外。彼得不是粗心的人——他不会在霍乱流行时喝生水。除非……他是故意的。或者是有人替他做了决定。", hint: "暗示深层真相" }
        ],
        round2: [
          { question: "你断绝关系后，是否仍然在暗中关注柴可夫斯基？", answer: "我……每一场演出我都有人去听。每一部新作品我都第一时间拿到乐谱。我只是不能再跟他通信了——有人警告我，如果继续联系，对他不利。", hint: "被迫断绝" },
          { question: "那笔5000卢布的'特别用途'支出是给谁的？", answer: "（脸色骤变）你从哪里看到的？那笔钱……那笔钱是给一个中间人的。我听说有人要威胁彼得，我想花钱消灾。但……钱送到了，人还是走了。", hint: "试图救人但失败" },
          { question: "谁警告你不要继续联系柴可夫斯基？", answer: "我不能说。我只能告诉你——那不是私人恩怨，那是……一个系统。一个比任何个人都强大的系统。我有钱，但我的钱在那个系统面前一文不值。", hint: "暗示体制性迫害" }
        ],
        round3: [
          { question: "你认为柴可夫斯基是被'处决'的吗？", answer: "不是处决——是'赐死'。有人给了他一个选择：公开审判身败名裂，或者……体面地离开。他选择了体面。但那不是选择——那是胁迫。", hint: "点明本质" },
          { question: "你后悔没有继续与他通信吗？", answer: "每一天。如果我没有断绝联系，也许我能阻止。也许我能让他知道——有人在爱他，不管发生什么。但我在他最需要我的时候沉默了。这是我无法原谅自己的。", hint: "悔恨" },
          { question: "最后一问：你对这个案件有什么想说的？", answer: "彼得·伊里奇一生都在用音乐表达无法用语言说出的话。他最后一部作品叫'悲怆'——你仔细听，会听到一个被逼入绝境的灵魂最后的呼喊。那不是音乐，那是他唯一能留下的证词。", hint: "最终真相指向" }
        ]
      }
    },
    rubinstein: {
      name: "鲁宾斯坦",
      nameRu: "А. Г. Рубинштейн",
      portrait: "/images/mystery2/portraits/portrait_rubinstein.jpg",
      location: "河边茶馆",
      district: "riverbank",
      buildingId: "teahouse",
      isCulprit: false,
      isComplicit: true,
      dialogues: {
        round1: [
          { question: "你和柴可夫斯基的关系如何？", answer: "复杂。我创办了莫斯科音乐学院，他是我请来的第一位和声老师。后来我们闹翻了——他嫌我太保守，我嫌他太感性。但归根结底，我尊重他的才华。", hint: "坦率但有保留" },
          { question: "柴可夫斯基死前有没有找过你？", answer: "……找过。他来找我，说有人威胁要公开他的秘密。我告诉他——名声比命重要。我……现在后悔说了那句话。", hint: "愧疚" },
          { question: "你觉得柴可夫斯基的死有什么蹊跷？", answer: "蹊跷？一个在霍乱流行时喝生水的人，死因还能是什么？但……柴可夫斯基不是傻子。他不会做那种蠢事，除非——他觉得自己已经没有退路了。", hint: "矛盾" }
        ],
        round2: [
          { question: "你告诉柴可夫斯基'名声比命重要'——你是在建议他自杀吗？", answer: "不！我不是那个意思！我只是……我只是说出了我们这个社会的基本规则——在这个帝国里，名声就是一切。失去名声，比失去生命更可怕。我没有让他去死！", hint: "防御性愤怒" },
          { question: "你知道'那个法庭'的存在吗？", answer: "……我听说过。一个由同窗组成的私设法庭，专门处理……某些道德问题。他们给被告两个选择：公开审判或自行了断。柴可夫斯基是他们最显赫的被告。", hint: "承认知情" },
          { question: "那个法庭的成员都有谁？", answer: "我不能告诉你全部。但我能说——都是柴可夫斯基的法学院同窗。他们自诩为'荣誉法庭'，实际上不过是自以为正义的刽子手。", hint: "揭露体制" }
        ],
        round3: [
          { question: "你有没有机会阻止这一切？", answer: "有。他来找我的时候，如果我说'活下去，管他什么名声'——也许他就不会走上那条路。但我没有。我选择了这个社会的规则，而不是一个人的生命。", hint: "自我审判" },
          { question: "柴可夫斯基的《悲怆》你听过吗？", answer: "首演时我在场。当我听到第四乐章那个逐渐消逝的结尾……我哭了。不是因为音乐美——而是因为我知道，那是他在跟我告别。而我辜负了他。", hint: "真情" },
          { question: "最后一问：你认为谁应该为柴可夫斯基之死负责？", answer: "那个法庭。那杯水。这个把名声看得比人命重的时代。还有我——因为我在他最需要一句'活下去'的时候，说了'名声更重要'。", hint: "承认同谋" }
        ]
      }
    },
    taneyev: {
      name: "塔涅耶夫",
      nameRu: "С. И. Танеев",
      portrait: "/images/mystery2/portraits/portrait_taneyev.jpg",
      location: "柴可夫斯基的办公室",
      district: "conservatory",
      buildingId: "tchaikovsky-office",
      isCulprit: false,
      dialogues: {
        round1: [
          { question: "作为柴可夫斯基的学生，你最后见他是什么时候？", answer: "首演前三天。他来办公室拿乐谱，我看到他的手在抖。我问他怎么了，他说：'谢廖沙，替我照看好我的学生。'——他从来没说过这种话。", hint: "预感性告别" },
          { question: "你从柴可夫斯基的音乐中听出了什么？", answer: "告别的和声。《悲怆》第四乐章的下行音阶不是普通的终止——那是灵魂坠落的轨迹。我给老师写信说'这是告别的和声'，他回了我一句：'你听对了。'", hint: "音乐解密" },
          { question: "你怀疑柴可夫斯基的死因吗？", answer: "我不仅是怀疑。他死前一周改变了遗嘱，把所有手稿交给了我——不是交给莫杰斯特。他信任我，因为我知道他的秘密，而且我不会用它来'保护他的名誉'——我会用它来追寻真相。", hint: "掌握关键证据" }
        ],
        round2: [
          { question: "柴可夫斯基把什么手稿交给了你？", answer: "一封他写给'荣誉法庭'的回信草稿。他在信中说：'我接受你们的裁决。但我要求——让我的音乐替我活下去。'这封信从未被公开。", hint: "核心物证" },
          { question: "什么是'荣誉法庭'？", answer: "柴可夫斯基在帝国法学院读书时的同窗们组成的秘密组织。当他们发现一位同学的'道德问题'时，会召开私人审判。裁决永远是两个选择：公开曝光，或自行了断。柴可夫斯基是他们的牺牲品之一。", hint: "揭露秘密组织" },
          { question: "为什么这件事至今没有真相？", answer: "因为每一个知情者都选择了'保护名誉'。莫杰斯特在销毁证据，尤根松在数钱，鲁宾斯坦在沉默——而我，我在等一个愿意听真相的人。你来了。", hint: "唯一愿意说出真相的人" }
        ],
        round3: [
          { question: "如果真相公之于众，柴可夫斯基的名誉会受损吗？", answer: "也许会。但那又怎样？他被逼死了，我们却要为了一个虚假的'完美形象'继续说谎？柴可夫斯基自己说过——'我宁愿被真实地恨，也不愿被虚伪地爱。'", hint: "坚持真相" },
          { question: "你打算怎么处理那封草稿？", answer: "我一直在等。等这个社会准备好了。也许不是今天，也许不是我的有生之年——但真相不会永远被埋葬。它会在某个清晨，从泥土里长出来，像《悲怆》最后一页的那个C大调三和弦——微弱，但确凿。", hint: "诗意但坚定" },
          { question: "最后一问：你希望玩家怎么做？", answer: "揭穿真相。哪怕真相会让所有人不舒服。因为沉默本身就是共谋——我已经沉默太久了。", hint: "最终抉择指引" }
        ]
      }
    },
    rachmaninoff: {
      name: "拉赫玛尼诺夫",
      nameRu: "С. В. Рахманинов",
      portrait: "/images/mystery2/portraits/portrait_rachmaninoff.jpg",
      location: "大剧院后台",
      district: "theater",
      buildingId: "backstage",
      isCulprit: false,
      dialogues: {
        round1: [
          { question: "你和柴可夫斯基最后那次见面是什么时候？", answer: "首演当天下午。他来后台听我弹琴，弹完后他说——'你是未来。'然后他的眼神暗了下来，像是在说：而我已经不是了。", hint: "深沉回忆" },
          { question: "你觉得柴可夫斯基知道自己要死吗？", answer: "他不是'知道'——他是'决定'了。《悲怆》不是写完之后才取名的，他一开始就决定了叫这个名字。悲怆——Патетическая——不是悲伤，是激情走向毁灭。他在写自己的挽歌。", hint: "音乐洞察" },
          { question: "你看到什么可疑的事了吗？", answer: "首演当晚，有个军官一直站在三楼的角落包厢里。演出结束后他去了后台——然后柴可夫斯基的脸就白了。我不知道他们说了什么，但柴可夫斯基从此再没笑过。", hint: "目击军官" }
        ],
        round2: [
          { question: "柴可夫斯基对你说的最后一句话是什么？", answer: "'谢廖沙，替我记住——音乐不说谎。人会说谎，社会会说谎，但音符不会。如果你想了解我，听我的音乐。'——他叫我'谢廖沙'，这是他第一次这么叫我。好像在交代后事。", hint: "遗言般嘱托" },
          { question: "你对'霍乱'这个死因怎么看？", answer: "我二十岁，没有资格质疑官方结论。但我有耳朵。《悲怆》第四乐章那个结尾——b小调到D大调再到b小调的游移——那不是'自然死亡'的音乐，那是'被迫赴死'的音乐。如果你懂和声，你就知道他在说什么。", hint: "音乐分析法" },
          { question: "你知道那个军官是谁吗？", answer: "不知道名字。但我记得他的军装上有法学院的徽章——那不是战斗部队的军装，是司法系统的。军队和法律——在俄罗斯，它们是同一回事。", hint: "关键身份线索" }
        ],
        round3: [
          { question: "柴可夫斯基的死会影响你的音乐创作吗？", answer: "已经影响了。我最近写的曲子里反复出现一个动机——下降的小六度。那是从《悲怆》第一乐章借来的。我不知道自己在致敬还是在哀悼。也许两者都是。", hint: "音乐传承" },
          { question: "你觉得真相有一天会被揭开吗？", answer: "我不确定。在俄罗斯，真相经常被埋在雪里。但音乐不会——音乐会融化雪。也许一百年后，会有人真正听懂《悲怆》，然后一切都会清楚。", hint: "预言" },
          { question: "最后一问——你想对柴可夫斯基说什么？", answer: "谢谢您让我成为'未来'。但我多希望——您也能在那里看见它。", hint: "深情告别" }
        ]
      }
    },
    jurgenson: {
      name: "尤根松",
      nameRu: "П. И. Юргенсон",
      portrait: "/images/mystery2/portraits/portrait_jurgenson.jpg",
      location: "出版社",
      district: "mansion",
      buildingId: "jurgenson-office",
      isCulprit: false,
      isBeneficiary: true,
      dialogues: {
        round1: [
          { question: "你和柴可夫斯基的商业关系如何？", answer: "他是我的金矿——不，这么说太粗俗了。他是我的朋友，也是我最重要的作者。我出版了他几乎所有作品。他的成功就是我的成功。", hint: "掩饰贪婪" },
          { question: "柴可夫斯基死后，版权归属有变化吗？", answer: "按照合同，作者身故后版权仍归出版社——这在出版业是惯例。我不否认我从中获益，但这是合法的。", hint: "合法但冷酷" },
          { question: "你觉得柴可夫斯基的死可疑吗？", answer: "我不关心死因。我只关心——他留下的音乐足够让我们的合作延续几十年。这话听起来很冷血，但商人就是商人。", hint: "毫不掩饰" }
        ],
        round2: [
          { question: "你在柴可夫斯基死前一个月签的那份合同，条款对你异常有利——这是巧合吗？", answer: "（不自在地挪动）合同是柴可夫斯基自己提出修改的。他说——'万一我有什么意外，确保音乐能继续出版。'我当时以为他只是年纪大了开始担心……", hint: "被柴可夫斯基预判" },
          { question: "你和莫杰斯特之间有什么交易？", answer: "没有交易！我只是……帮他处理了一些文件。传记出版的事宜、版权分配——都是正常业务。他的传记会带来更多版税，这是双赢。", hint: "利用悲剧" },
          { question: "你知道'荣誉法庭'的事吗？", answer: "我……听说过一些传闻。出版行业消息灵通。但我不是当事人，我不便评论。我只能说——如果真的存在那样的事，那是我这辈子听过的最'俄式'的正义。", hint: "知情但回避" }
        ],
        round3: [
          { question: "你是在从柴可夫斯基的死亡中获利吗？", answer: "是。我不会否认。《悲怆》首演后的销量是我二十年出版生涯的最高点。他的死让他的音乐更畅销——这是可耻的，但这是事实。", hint: "承认获利" },
          { question: "如果真相曝光影响销量，你会阻止吗？", answer: "……（长叹）我是商人，商人逐利。但我也热爱柴可夫斯基的音乐。如果真要选——我希望一百年后人们还在演奏他的作品，而不管他是怎么死的。真相重要，音乐更重要。", hint: "矛盾但诚实" },
          { question: "最后一问：你对这个案件有什么想说的？", answer: "在俄罗斯，每个人都在从别人的悲剧中获利。我是，莫杰斯特是，宫廷是，连你们这些调查员也是——你们也在消费这个故事。唯一的区别是，我至少承认这一点。", hint: "冷漠中的一丝清醒" }
        ]
      }
    }
  },

  unlockConditions: {
    "cemetery": {
      requiredClues: ["court-martial-file"],
      message: "你发现了军事法庭的卷宗，现在可以前往墓园查看被篡改的死亡证明了……"
    }
  },

  caseResult: {
    culprit: "system",
    culpritName: "整个体制",
    victimName: "柴可夫斯基",
    victimPortrait: "/images/mystery2/portraits/portrait_tchaikovsky.jpg",
    truth: "这不是一个人的罪行，而是一个时代的共谋。\n\n柴可夫斯基的死，是一条完整的锁链——\n\n荣誉法庭（他的法学院同窗）发出裁决：自行了断，否则公开审判。\n那杯生水（有人递到他手中）是执行工具——在霍乱肆虐的圣彼得堡，这等于死刑。\n莫杰斯特（他弟弟）选择了掩盖，发电报'对外宣称霍乱'——他在保护名誉而非真相。\n鲁宾斯坦说'名声比命重要'——无意中成了推手。\n冯·梅克夫人试图用钱救人，但为时已晚。\n尤根松在死人身上数钱——虽然他不是凶手，却是受益者。\n\n柴可夫斯基知道自己即将死去，所以他写了《悲怆》。那不是一部普通交响曲——那是遗书。第四乐章那个逐渐消逝的结尾，b小调到D大调再到虚无——他在用和声写下自己被迫赴死的绝望。\n\n他选择了体面地死，而不是屈辱地活。但这不是选择——这是胁迫。\n\n这个案件的真相是：在19世纪的俄罗斯帝国，名誉比人命重要，体制比个人强大，而沉默是最普遍的共谋。\n\n你愿意揭穿真相吗？代价是——柴可夫斯基的'完美形象'将不复存在。",
    knowledge: [
      {
        title: "柴可夫斯基死因之谜",
        content: "柴可夫斯基于1893年11月6日去世，官方死因为霍乱。但关于其死因的争议从未停止。一种理论认为他因'荣誉法庭'裁决而被迫自杀——由帝国法学院的同窗组成秘密法庭，因其同性恋倾向而判处其'自行了断'。这一理论由俄国音乐学家亚历山德拉·奥尔洛娃在1980年代提出，但至今仍有学者争议。",
        source: "音乐学史·柴可夫斯基研究"
      },
      {
        title: "《悲怆》第六交响曲",
        content: "柴可夫斯基b小调第六交响曲（Op.74），俄语名Патетическая（Pateticheskaya），意为'充满激情的'而非简单的'悲伤'。作品于1893年10月28日首演，九天后柴可夫斯基去世。第四乐章以极慢速度逐渐消逝，打破了交响曲以辉煌终曲结束的传统，被视为音乐史上最惊人的结构创新之一。",
        source: "交响曲研究·浪漫主义晚期"
      },
      {
        title: "冯·梅克夫人的精神恋爱",
        content: "纳杰日达·冯·梅克（Надежда фон Мекк）是俄国铁路大亨遗孀，从1876年至1890年间资助柴可夫斯基，两人约定永不见面，仅通过信件交流。14年间共交换了约1200封信。1890年，冯·梅克突然终止了资助和通信，官方原因是经济困难，但真实原因可能与她发现了柴可夫斯基的性取向有关。",
        source: "柴可夫斯基传记·书信研究"
      }
    ]
  }
};

export default worldMap;
