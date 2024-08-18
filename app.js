const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode_terminal = require('qrcode-terminal');

// Initialize WhatsApp Client
// const client = new Client({
//     authStrategy: new LocalAuth() // This will handle storing and reusing your session
//     puppeteer: {
//         executablePath: chromium.path // Указываем путь к установленному Chromium
//     }
// });

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
        authStrategy: new LocalAuth()
    }
});

// Client is ready to start handling messages
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

// Store user states
let userStates = { state: ' ', question: ' ' };
let questionnaireAnswer = {};
let expertHelpAnswer = {};

const questions = [
    "Какова основная цель вашей инвестиции в недвижимость на Бали?",
    "Каким типом недвижимости вы интересуетесь?",
    "Каков ваш бюджет на покупку недвижимости?",
    "В каком районе Бали вы предпочитаете инвестировать?",
    "Какую ожидаемую доходность или выгоду вы планируете получить от инвестиций в недвижимость на Бали?",
    "Когда вы планируете совершить покупку недвижимости?",
    "Есть ли у вас какие-либо особые требования или предпочтения к недвижимости, которую вы ищете?",
    "Метод оплаты?",
    "Как вы хотели бы произвести оплату?",
    "Пожалуйста, укажите ваше полное имя:",
    "Пожалуйста, укажите контактный номер телефона, связанный с мессенджерами:"
];


const options = [
    ["Для личного проживания", "Для получения дохода от аренды", "Для перепродажи с прибылью", "Другое (пожалуйста, уточните в сообщении ниже)"],
    ["Апартаменты", "Вилла", "Земельный участок", "Коммерческая недвижимость", "Другое (пожалуйста, уточните в сообщении ниже)"],
    ["До $100,000", "$100,000 - $300,000", "$300,000 - $500,000", "$500,000 - $1,000,000", "Более $1,000,000"],
    ["Кута", "Семиньяк", "Чангу", "Убуд", "Джимбаран", "Другие районы (пожалуйста, уточните в сообщении ниже)"],
    ["До 5% годовых", "5-10% годовых", "10-15% годовых", "Более 15% годовых", "Трудно сказать, рассчитываю на вашу помощь в оценке"],
    ["В течение ближайших 3 месяцев", "В течение 6 месяцев", "В течение года", "Более года"],
    ["Да (пожалуйста, уточните в сообщении ниже)", "Нет"],
    ["Банковский перевод", "Криптовалюта", "Оплата наличными"],
    ["Рассрочка", "Полная сумма"]
];

// Handling incoming messages
client.on('message', async (msg) => {
    const chatId = msg.from;
    console.log(`Received message from ${chatId}: ${msg.body}`);

    // Example: Reply to a specific message
    if (msg.body.toLowerCase() === 'start' || msg.body.toLowerCase() === 'старт') {
        try {
            userStates[chatId] = { state: 'main_menu', question: '' };
            const introText =
                "Приветствуем вас в АН “Condor Real Estates”!\n\n" +
                "Мы рады приветствовать вас в нашем WhatsApp-боте! Наша инвестиционная компания специализируется на недвижимости на Бали, предоставляя вам уникальные возможности для выгодных вложений в один из самых живописных уголков мира.\n\n" +
                "Мы предлагаем широкий спектр услуг, включая покупку, продажу и аренду недвижимости, а также консультации по инвестициям и управлению объектами. Наши эксперты всегда готовы помочь вам найти наилучшие решения для достижения ваших финансовых целей.\n\n" +
                "С чего вам начать ⁉️\n" +
                "➡️Пройти опрос, чтобы мы смогли подобрать вам варианты недвижимости под ваш запрос и вы наглядно увидели, что можете получить на ваш бюджет.\n➡️Следите за нашими обновлениями, получайте актуальную информацию о новых объектах и специальных предложениях, а также задавайте вопросы — мы всегда на связи и готовы помочь!\n\n" +
                "Спасибо, что выбрали нас. Давайте вместе создадим Ваше успешное будущее на Бали!\n\n" +
                "⬇️Сделайте свой выбор⬇️";

            const menuText =
                "1. Анкета\n" +
                "2. Экспертная помощь с недвижимостью\n" +
                "3. [О нас](https://t.me)\n" +
                "4. Стратегии инвестирования\n\n" +
                "Ответьте на это сообщение с номером выбранного варианта, чтобы продолжить.";

            await await client.sendMessage(chatId, introText);
            await await client.sendMessage(chatId, menuText);
        } catch (error) {
            await console.log(userStates[chatId]);
            await console.log("ERROR SENDING - " + error);
        }
    } else if (userStates[chatId].state === 'main_menu' && msg.body === "1") {
        userStates[chatId].state = "questionaire";
        userStates[chatId].question = "1";
        const messageIntro = `
🌟 *Добро пожаловать в наш опросник!* 🌟

Вы сейчас проходите опрос, в котором вам будут заданы вопросы с пронумерованными вариантами ответов. Пожалуйста, отвечайте, отправляя только номер вашего выбора. 

Если в опросе появится вариант с просьбой "*уточните информацию в чате*", просто напишите в чат описание вашего ответа.

Ваше участие поможет нам лучше понять ваши потребности и предоставить вам наиболее подходящую информацию. Спасибо за ваше время и внимание!
    `;

        await client.sendMessage(chatId, messageIntro, { parse_mode: 'Markdown' });
        await sendQuestion(chatId, questions[0], options[0]);
    } else if (userStates[chatId].state === 'main_menu' && msg.body === "2") {
        await client.sendMessage(msg.from,
            '*Добро пожаловать в Condor Real Estates.*\n\n' +
            'Мы специализируемся на инвестициях в недвижимость на Бали и готовы помочь вам сделать правильный выбор. ' +
            'Пожалуйста, заполните свои контактные данные, чтобы наши специалисты могли связаться с вами и предоставить всю необходимую информацию.\n\n' +
            'Ваши данные будут использоваться исключительно для связи с вами и предоставления консультаций по инвестициям в недвижимость.',
            { parse_mode: 'Markdown' }
        );

        await client.sendMessage(chatId,
            '*Пожалуйста, укажите ваш адрес электронной почты:*',
            { parse_mode: 'Markdown' }
        );
        userStates[chatId].state = 'expert_help';
        userStates[chatId].question = 'email';
    } else if (userStates[chatId].state === 'main_menu' && msg.body === "3") {
        const aboutUsText = `*О нас*\n\n` +
            `Добро пожаловать в Condor Real Estates! Мы специализируемся на инвестициях в недвижимость на Бали, помогая нашим клиентам делать выгодные и продуманные решения.\n\n` +
            `Узнать больше о нас и наших услугах вы можете на нашем сайте: https://www.example.com.\n\n` +
            `Мы стремимся обеспечить вас всей необходимой информацией для успешных инвестиций и готовы ответить на любые ваши вопросы.\n\n` +
            `Если вы хотите получить информацию о стратегиях, или поспользоваться другими функциями бота, то введите номер истересуемого пункта меню в чат:\n` +
            `1. Анкета\n` +
            `2. Экспертная помощь с недвижимостью\n` +
            `4. Стратегии инвестирования`;
        await client.sendMessage(msg.from, aboutUsText, { parse_mode: 'Markdown' });
    } else if (userStates[chatId].state === 'main_menu' && msg.body === "4") {
        userStates[chatId].state = 'strategy_menu';
        const strategiesText =
            'Стратегии инвестирования в недвижимость на Бали\n\n' +
            '1. Стратегия аренды\n' +
            '2. Стратегия перепродажи\n' +
            '3. Аренда с последующей перепродажей\n\n' +
            '⬇️Чтобы узнать больше о каждой из этих стратегий, отправьте соответствующий номер⬇️';

        await client.sendMessage(chatId, strategiesText);

    } else if (userStates[chatId].state === 'strategy_menu') {
        const messageText = msg.body.trim();
        if (messageText === "1") {
            await client.sendMessage(chatId,
                "*1. Стратегия аренды*\n\n" +
                "*Описание:* Стратегия аренды предполагает покупку недвижимости с целью её последующей сдачи в аренду для получения регулярного дохода. Этот подход подходит для инвесторов, которые ищут стабильный и предсказуемый доход от своего вложения.\n\n" +
                "*Преимущества:*\n    • Регулярный поток доходов от аренды.\n    • Возможность увеличения арендной платы в зависимости от рыночных условий.\n    • Недвижимость остается в собственности, что позволяет воспользоваться приростом её стоимости в будущем.\n\n" +
                "*Риски:*\n    • Необходимость управления недвижимостью (поиск арендаторов, техническое обслуживание и ремонт).\n    • Возможность временных периодов без арендаторов.\n    • Изменение рыночных условий, которые могут повлиять на уровень арендной платы.\n\n" +
                "*Пример расчета:*\n    • Цена апартаментов: $150,000\n    • Дневная арендная плата: $120\n    • Средняя заполняемость: 70% (255 дней в году)\n    • Годовой доход: 255 дней * $120 = $30,600\n    • Годовые расходы на обслуживание (10%): $3,060\n    • Чистый годовой доход: $27,540\n    • Годовая доходность: 18.36%\n\n",
                { parse_mode: 'Markdown' }
            );
            await client.sendMessage(chatId,
                "Вы ознакомились со *Стратегией аренды*.\n\n" +
                "*Остальные стратегии:*\n" +
                "2. *Стратегия перепродажи*\n" +
                "3. *Аренда с последующей перепродажей*\n\n" +
                "Для выбора другой стратегии отправьте номер (2 или 3).\n" +
                "Для возвращения в главное меню отправьте 'старт'."
            );
        } else if (messageText === "2") {
            await client.sendMessage(chatId,
                "*2. Стратегия перепродажи*\n\n" +
                "*Описание:* Стратегия перепродажи предполагает покупку недвижимости с целью её последующей продажи по более высокой цене. Это подход для инвесторов, которые ищут возможность получения единовременной прибыли от изменения стоимости недвижимости.\n\n" +
                "*Преимущества:*\n    • Возможность значительного увеличения капитала при успешной перепродаже.\n    • Нет необходимости в управлении недвижимостью в долгосрочной перспективе.\n\n" +
                "*Риски:*\n    • Зависимость от рыночных условий и колебаний цен на недвижимость.\n    • Расходы на продажу (комиссии, налоги и другие сборы).\n    • Возможные временные затраты на продажу недвижимости.\n\n" +
                "*Пример расчета:*\n    • Цена апартаментов: $150,000\n    • Ожидаемая цена продажи через год: $172,000\n    • Расходы на продажу (5%): $8,600\n    • Чистый доход от перепродажи: $13,400\n    • Годовая доходность: 8.93%\n\n",
                { parse_mode: 'Markdown' }
            );
            await client.sendMessage(chatId,
                "Вы ознакомились со *Стратегией перепродажи*.\n\n" +
                "*Остальные стратегии:*\n" +
                "1. *Стратегия аренды*\n" +
                "3. *Аренда с последующей перепродажей*\n\n" +
                "Для выбора другой стратегии отправьте номер (1 или 3).\n" +
                "Для возвращения в главное меню отправьте 'старт'."
            );
        } else if (messageText === "3") {
            await client.sendMessage(chatId,
                "*3. Аренда с последующей перепродажей*\n\n" +
                "*Описание:* Комбинированная стратегия включает в себя сдачу недвижимости в аренду на определенный период с последующей продажей. Этот подход позволяет инвестору получать текущий доход от аренды, а затем извлечь прибыль от прироста стоимости недвижимости.\n\n" +
                "*Преимущества:*\n    • Возможность получения двойного дохода: текущего от аренды и капитального от перепродажи.\n    • Более высокая совокупная доходность.\n\n" +
                "*Риски:*\n    • Необходимость управления недвижимостью на этапе аренды.\n    • Возможные изменения рыночных условий, которые могут повлиять как на арендную плату, так и на цену продажи.\n    • Расходы на продажу (комиссии, налоги и другие сборы).\n\n" +
                "*Пример расчета:*\n    • Цена апартаментов: $150,000\n    • Дневная арендная плата: $120\n    • Средняя заполняемость: 70% (255 дней в году)\n    • Годовой доход от аренды: $27,540\n    • Ожидаемая цена продажи через год: $172,000\n    • Расходы на продажу (5%): $8,600\n    • Чистый доход от перепродажи: $13,400\n    • Совокупный годовой доход: $40,940\n    • Совокупная годовая доходность: 27.29%\n\n",
                { parse_mode: 'Markdown' }
            );
            await client.sendMessage(chatId,
                "Вы ознакомились со *Аренда с последующей перепродажей*.\n\n" +
                "*Остальные стратегии:*\n" +
                "1. *Стратегия аренды*\n" +
                "2. *Стратегия перепродажи*\n\n" +
                "Для выбора другой стратегии отправьте номер (1 или 2).\n" +
                "Для возвращения в главное меню отправьте 'старт'."
            );
        } else {
            await client.sendMessage(chatId, 'Неверный выбор. Пожалуйста, отправьте номер от 1 до 3 для выбора стратегии.');
        }
    } else if (userStates[chatId].state === 'questionaire') {
        if (userStates[chatId].question === "1") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId] = { answer1: options[0][1] };
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId] = { answer1: options[0][2] };
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId] = { answer1: options[0][3] };
            } else {
                questionnaireAnswer[chatId] = { answer1: msg.body };
            }
            userStates[chatId].question = "2";
            await sendQuestion(chatId, questions[1], options[1]);
        } else if (userStates[chatId].question === "2") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer2 = options[1][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer2 = options[1][1];
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId].answer2 = options[1][2];
            } else if (msg.body.trim() === "4") {
                questionnaireAnswer[chatId].answer2 = options[1][3];
            } else {
                questionnaireAnswer[chatId].answer2 = msg.body;
            }
            userStates[chatId].question = "3";
            await sendQuestion(chatId, questions[2], options[2]);
        } else if (userStates[chatId].question === "3") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer3 = options[2][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer3 = options[2][1];
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId].answer3 = options[2][2];
            } else if (msg.body.trim() === "4") {
                questionnaireAnswer[chatId].answer3 = options[2][3];
            } else if (msg.body.trim() === "5") {
                questionnaireAnswer[chatId].answer3 = options[2][4];
            } else {
                questionnaireAnswer[chatId].answer3 = msg.body;
            }
            userStates[chatId].question = "4";
            await sendQuestion(chatId, questions[3], options[3]);
        } else if (userStates[chatId].question === "4") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer4 = options[3][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer4 = options[3][1];
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId].answer4 = options[3][2];
            } else if (msg.body.trim() === "4") {
                questionnaireAnswer[chatId].answer4 = options[3][3];
            } else if (msg.body.trim() === "5") {
                questionnaireAnswer[chatId].answer4 = options[3][4];
            } else {
                questionnaireAnswer[chatId].answer4 = msg.body;
            }
            userStates[chatId].question = "5";
            await sendQuestion(chatId, questions[4], options[4]);
        } else if (userStates[chatId].question === "5") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer5 = options[4][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer5 = options[4][1];
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId].answer5 = options[4][2];
            } else if (msg.body.trim() === "4") {
                questionnaireAnswer[chatId].answer5 = options[4][3];
            } else if (msg.body.trim() === "5") {
                questionnaireAnswer[chatId].answer5 = options[4][4];
            } else {
                questionnaireAnswer[chatId].answer5 = msg.body;
            }
            userStates[chatId].question = "6";
            await sendQuestion(chatId, questions[5], options[5]);
        } else if (userStates[chatId].question === "6") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer6 = options[5][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer6 = options[5][1];
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId].answer6 = options[5][2];
            } else if (msg.body.trim() === "4") {
                questionnaireAnswer[chatId].answer6 = options[5][3];
            } else {
                questionnaireAnswer[chatId].answer6 = msg.body;
            }
            userStates[chatId].question = "7";
            await sendQuestion(chatId, questions[6], options[6]);
        } else if (userStates[chatId].question === "7") {
            if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer7 = options[6][1];
            } else {
                questionnaireAnswer[chatId].answer7 = msg.body;
            }
            userStates[chatId].question = "8";
            await sendQuestion(chatId, questions[7], options[7]);
        } else if (userStates[chatId].question === "8") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer8 = options[7][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer8 = options[7][1];
            } else if (msg.body.trim() === "3") {
                questionnaireAnswer[chatId].answer8 = options[7][2];
            } else {
                questionnaireAnswer[chatId].answer8 = msg.body;
            }
            userStates[chatId].question = "9";
            await sendQuestion(chatId, questions[8], options[8]);
        } else if (userStates[chatId].question === "9") {
            if (msg.body.trim() === "1") {
                questionnaireAnswer[chatId].answer9 = options[8][0];
            } else if (msg.body.trim() === "2") {
                questionnaireAnswer[chatId].answer9 = options[8][1];
            } else {
                questionnaireAnswer[chatId].answer9 = msg.body;
            }
            userStates[chatId].question = "10";
            await sendQuestion(chatId, questions[9], []);
        } else if (userStates[chatId].question === "10") {
            questionnaireAnswer[chatId].answer10 = msg.body;
            userStates[chatId].question = "11";
            await sendQuestion(chatId, questions[10], []);
        } else if (userStates[chatId].question === "11") {
            questionnaireAnswer[chatId].answer11 = msg.body;
            const message = `📝 * Анкета заполнена *\n\n` +
                `1. * Цель инвестиции *: ${questionnaireAnswer[chatId].answer1} \n` +
                `2. * Тип недвижимости *: ${questionnaireAnswer[chatId].answer2} \n` +
                `3. * Бюджет *: ${questionnaireAnswer[chatId].answer3} \n` +
                `4. * Предпочитаемый район *: ${questionnaireAnswer[chatId].answer4} \n` +
                `5. * Ожидаемая доходность *: ${questionnaireAnswer[chatId].answer5} \n` +
                `6. * Время покупки *: ${questionnaireAnswer[chatId].answer6} \n` +
                `7. * Особые требования *: ${questionnaireAnswer[chatId].answer7} \n` +
                `8. * Способ оплаты *: ${questionnaireAnswer[chatId].answer8} \n` +
                `9. * Предпочтение в оплате *: ${questionnaireAnswer[chatId].answer9} \n` +
                `10. * Полное имя *: ${questionnaireAnswer[chatId].answer10} \n` +
                `11. * Контактный номер телефона *: ${questionnaireAnswer[chatId].answer11} `;

            await client.sendMessage(process.env.MANAGER_GROUP, message);

            userStates[chatId].state = 'strategy_menu';
            await client.sendMessage(chatId, "Спасибо за заполнение анкеты. Мы скоро с вами свяжемся.\n\n Чтобы увидеть стратегии дохода отправьте цифру соответствующего пункта меню:\n\n" +
                "1. Стратегия аренды\n" +
                "2. Стратегия перепродажи\n" +
                "3. Аренда с последующей перепродажей\n\n" +
                "Если же Вы хотите вернуться к первоначальному меню, то отправьте 'старт' в чат");
            delete questionnaireAnswer[chatId];
        }
    } else if (userStates[chatId].state === 'expert_help') {
        if (userStates[chatId].question === 'email') {
            expertHelpAnswer[chatId] = { email: msg.body };
            await client.sendMessage(chatId,
                '*Пожалуйста, укажите ваш контактный номер телефона:*',
                { parse_mode: 'Markdown' }
            );
            userStates[chatId].question = 'phone';
        } else if (userStates[chatId].question === 'phone') {
            expertHelpAnswer[chatId].phone = msg.body;
            await client.sendMessage(chatId,
                '*Пожалуйста, укажите ваше ФИО:*',
                { parse_mode: 'Markdown' }
            );
            userStates[chatId].question = 'fio';
        } else if (userStates[chatId].question === 'fio') {
            expertHelpAnswer[chatId].fio = msg.body;
            await client.sendMessage(process.env.MANAGER_GROUP,
                '💡 *Тема:* Экспертная помощь с недвижимостью\n' +
                '📧 *Адрес электронной почты:* ' + expertHelpAnswer[msg.from].email + '\n' +
                '📱 *Номер телефона:* ' + expertHelpAnswer[msg.from].phone + '\n' +
                '👨🏻‍💻 *ФИО:* ' + expertHelpAnswer[msg.from].fio,
                { parse_mode: 'Markdown' }
            );
            userStates[chatId].state = 'strategy_menu';
            await client.sendMessage(chatId, "Наши консультанты свяжутся с вами в ближайшее время, чтобы обсудить ваши цели и предложить наиболее подходящие варианты инвестиций.\n\n Чтобы увидеть стратегии дохода отправьте цифру соответствующего пункта меню:\n\n" +
                "1. Стратегия аренды\n" +
                "2. Стратегия перепродажи\n" +
                "3. Аренда с последующей перепродажей\n\n" +
                "Если же Вы хотите вернуться к первоначальному меню, то отправьте 'старт' в чат");
        }
    }
});

async function sendQuestion(chatId, text, optionss) {
    const optionssText = optionss.map((options, index) => `${index + 1}. ${options} `).join('\n');
    await client.sendMessage(chatId, `${text} \n\n${optionssText} `);
}

// Start the client
// (async () => {
//     browser = await puppeteer.launch({
//         executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
//         args: [
//             '--no-sandbox', '--disable-setuid-sandbox'
//         ],
//         headless: true,
//     });
//     client.initialize();
// })();

client.initialize();

client.on('qr', async (qr) => {
        console.log('QR RECEIVED');
        qrcode_terminal.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
})