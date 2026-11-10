import { readStore, writeStore } from './store';

export type Locale = 'uz' | 'ru' | 'en';

const dictionary: Record<string, { uz: string; en: string }> = {
  'Главная': { uz: 'Bosh sahifa', en: 'Home' },
  'Каталог': { uz: 'Katalog', en: 'Listings' },
  'Каталог Makon': { uz: 'Makon katalogi', en: 'Makon listings' },
  'Каталог недвижимости': { uz: 'Ko‘chmas mulk katalogi', en: 'Property listings' },
  'Оценить': { uz: 'Baholash', en: 'Valuation' },
  'Оценить недвижимость': { uz: 'Ko‘chmas mulkni baholash', en: 'Value a property' },
  'AI-подбор': { uz: 'AI tanlov', en: 'AI search' },
  'Умный подбор': { uz: 'Aqlli tanlov', en: 'Smart search' },
  'Купить': { uz: 'Sotib olish', en: 'Buy' },
  'Арендовать': { uz: 'Ijaraga olish', en: 'Rent' },
  'Разместить': { uz: 'E’lon berish', en: 'Post listing' },
  'Разместить объявление': { uz: 'E’lon joylashtirish', en: 'Post a listing' },
  'Войти': { uz: 'Kirish', en: 'Sign in' },
  'Избранное': { uz: 'Saralanganlar', en: 'Favorites' },
  'Сравнить объекты': { uz: 'Obyektlarni solishtirish', en: 'Compare properties' },
  'Сравнение': { uz: 'Solishtirish', en: 'Compare' },
  'Личный кабинет': { uz: 'Shaxsiy kabinet', en: 'My account' },
  'Платформа': { uz: 'Platforma', en: 'Platform' },
  'Разместить на Makon': { uz: 'Makon’da e’lon berish', en: 'Post on Makon' },
  'О Makon': { uz: 'Makon haqida', en: 'About Makon' },
  'Конфиденциальность': { uz: 'Maxfiylik', en: 'Privacy' },
  'Условия использования': { uz: 'Foydalanish shartlari', en: 'Terms of use' },
  'Продажа': { uz: 'Sotuv', en: 'For sale' },
  'Аренда': { uz: 'Ijara', en: 'For rent' },
  'Посуточно': { uz: 'Kunlik ijara', en: 'Daily rent' },
  'Квартира': { uz: 'Kvartira', en: 'Apartment' },
  'Дом': { uz: 'Uy', en: 'House' },
  'Земля': { uz: 'Yer', en: 'Land' },
  'Гараж': { uz: 'Garaj', en: 'Garage' },
  'Коммерция': { uz: 'Tijorat', en: 'Commercial' },
  'Офис': { uz: 'Ofis', en: 'Office' },
  'Склад': { uz: 'Ombor', en: 'Warehouse' },
  'Квартиры': { uz: 'Kvartiralar', en: 'Apartments' },
  'Дома': { uz: 'Uylar', en: 'Houses' },
  'Участки': { uz: 'Yer uchastkalari', en: 'Land plots' },
  'Гаражи': { uz: 'Garajlar', en: 'Garages' },
  'Коммерция ·': { uz: 'Tijorat ·', en: 'Commercial ·' },
  'Тип сделки': { uz: 'Bitim turi', en: 'Deal type' },
  'Недвижимость': { uz: 'Ko‘chmas mulk', en: 'Property type' },
  'Местоположение': { uz: 'Joylashuv', en: 'Location' },
  'Город': { uz: 'Shahar', en: 'City' },
  'Район': { uz: 'Tuman', en: 'District' },
  'Цена': { uz: 'Narx', en: 'Price' },
  'Цена, $': { uz: 'Narx, $', en: 'Price, $' },
  'Площадь, м²': { uz: 'Maydon, m²', en: 'Area, m²' },
  'Площадь': { uz: 'Maydon', en: 'Area' },
  'Комнаты': { uz: 'Xonalar', en: 'Rooms' },
  'Состояние': { uz: 'Holati', en: 'Condition' },
  'Этаж': { uz: 'Qavat', en: 'Floor' },
  'Фильтры': { uz: 'Filtrlar', en: 'Filters' },
  'Сбросить': { uz: 'Tozalash', en: 'Reset' },
  'Любой': { uz: 'Istalgan', en: 'Any' },
  'Любой тип': { uz: 'Istalgan tur', en: 'Any type' },
  'Все города': { uz: 'Barcha shaharlar', en: 'All cities' },
  'Другие города': { uz: 'Boshqa shaharlar', en: 'Other cities' },
  'Любое количество': { uz: 'Istalgan miqdor', en: 'Any number' },
  'От': { uz: 'Dan', en: 'From' },
  'До': { uz: 'Gacha', en: 'To' },
  'Только проверенные': { uz: 'Faqat tekshirilganlar', en: 'Verified only' },
  'Поиск по объявлениям': { uz: 'E’lonlardan qidirish', en: 'Search listings' },
  'Сначала подходящие': { uz: 'Avval moslari', en: 'Best match' },
  'Сначала новые': { uz: 'Avval yangilari', en: 'Newest first' },
  'Сначала дешевле': { uz: 'Avval arzonlari', en: 'Lowest price first' },
  'Сначала дороже': { uz: 'Avval qimmatlari', en: 'Highest price first' },
  'Сетка': { uz: 'Katak', en: 'Grid' },
  'Список': { uz: 'Ro‘yxat', en: 'List' },
  'Карта': { uz: 'Xarita', en: 'Map' },
  'Найдите свой следующий адрес.': { uz: 'Keyingi manzilingizni toping.', en: 'Find your next address.' },
  'Объекты по всему Узбекистану — с нужными деталями и без лишнего шума.': { uz: 'O‘zbekiston bo‘ylab kerakli ma’lumotlarga ega ko‘chmas mulk.', en: 'Properties across Uzbekistan, with the details you need.' },
  'Найдите место,': { uz: 'O‘zingizga mos', en: 'Find a place' },
  'которое станет': { uz: 'maskan toping,', en: 'to call' },
  'вашим.': { uz: 'sizniki bo‘lsin.', en: 'your own.' },
  'Недвижимость с умным подходом': { uz: 'Ko‘chmas mulkka aqlli yondashuv', en: 'A smarter way to find property' },
  'Выберите направление': { uz: 'Yo‘nalishni tanlang', en: 'Choose a category' },
  'Найдите свой формат': { uz: 'O‘zingizga mosini toping', en: 'Find the right fit' },
  'Выбор Makon': { uz: 'Makon tanlovi', en: 'Makon picks' },
  'Предложения, на которые стоит посмотреть': { uz: 'Ko‘rib chiqishga arziydigan takliflar', en: 'Listings worth a look' },
  'Города Узбекистана': { uz: 'O‘zbekiston shaharlari', en: 'Cities of Uzbekistan' },
  'Где бы вы хотели жить?': { uz: 'Qayerda yashashni xohlaysiz?', en: 'Where would you like to live?' },
  'Почему Makon': { uz: 'Nega Makon?', en: 'Why Makon' },
  'Весь путь — в одном месте': { uz: 'Barcha imkoniyatlar bir joyda', en: 'Everything you need in one place' },
  'Найти': { uz: 'Qidirish', en: 'Search' },
  'Смотреть каталог': { uz: 'Katalogni ko‘rish', en: 'Browse listings' },
  'Оценить объект': { uz: 'Obyektni baholash', en: 'Value a property' },
  'Пока ничего не сохранено': { uz: 'Hozircha saqlangan e’lon yo‘q', en: 'No saved listings yet' },
  'Добавьте объекты для сравнения': { uz: 'Solishtirish uchun obyekt qo‘shing', en: 'Add properties to compare' },
  'Откройте каталог': { uz: 'Katalogni ochish', en: 'Browse listings' },
  'Перейти в каталог': { uz: 'Katalogga o‘tish', en: 'Go to listings' },
  'Сбросить фильтры': { uz: 'Filtrlarni tozalash', en: 'Clear filters' },
  'По этим параметрам пока нет вариантов': { uz: 'Bu mezonlarga mos variant topilmadi', en: 'No listings match these filters' },
  'Измените пару условий — возможно, подходящий объект совсем рядом.': { uz: 'Mezonlarni o‘zgartirib ko‘ring — mos obyekt topilishi mumkin.', en: 'Try adjusting your filters to find a match.' },
  'Добавлено в избранное': { uz: 'Saralanganlarga qo‘shildi', en: 'Added to favorites' },
  'Удалено из избранного': { uz: 'Saralanganlardan olib tashlandi', en: 'Removed from favorites' },
  'Добавлено к сравнению': { uz: 'Solishtirishga qo‘shildi', en: 'Added to comparison' },
  'Убрано из сравнения': { uz: 'Solishtirishdan olib tashlandi', en: 'Removed from comparison' },
  'Можно сравнить не более четырёх объектов.': { uz: 'Ko‘pi bilan to‘rtta obyektni solishtirish mumkin.', en: 'You can compare up to four properties.' },
  'Оценка недвижимости': { uz: 'Ko‘chmas mulkni baholash', en: 'Property valuation' },
  'Ориентир для важных решений.': { uz: 'Muhim qarorlar uchun taxminiy narx.', en: 'A guide for important decisions.' },
  'Добавьте основные характеристики, чтобы получить предварительный расчёт стоимости.': { uz: 'Taxminiy narxni hisoblash uchun asosiy xususiyatlarni kiriting.', en: 'Enter the key details to get an estimated value.' },
  'Тип недвижимости': { uz: 'Ko‘chmas mulk turi', en: 'Property type' },
  'Фотографии, если есть': { uz: 'Mavjud bo‘lsa, suratlar', en: 'Photos (optional)' },
  'Как читать результат': { uz: 'Natijani qanday tushunish kerak', en: 'How to read the estimate' },
  'Получить ориентир': { uz: 'Taxminiy narxni bilish', en: 'Get an estimate' },
  'Сопоставляю запрос с демонстрационными объявлениями…': { uz: 'So‘rov demo e’lonlar bilan solishtirilmoqda…', en: 'Matching your search with sample listings…' },
  'Ваши ориентиры': { uz: 'Sizning mezonlaringiz', en: 'Your preferences' },
  'Дополните запрос деталями': { uz: 'So‘rovga batafsil ma’lumot qo‘shing', en: 'Add more details to your search' },
  'Бюджет до, $': { uz: 'Byudjet, $ gacha', en: 'Budget up to, $' },
  'Место работы': { uz: 'Ish joyi', en: 'Workplace' },
  'Время в пути, мин': { uz: 'Yo‘l vaqti, daqiqa', en: 'Commute time, min' },
  'Предпочитаемый район': { uz: 'Afzal ko‘rilgan tuman', en: 'Preferred district' },
  'Новый подбор': { uz: 'Yangi qidiruv', en: 'New search' },
  'Расскажите, что ищете.': { uz: 'Nimani qidirayotganingizni ayting.', en: 'Tell us what you are looking for.' },
  'Разместить объявление — Makon': { uz: 'Makon’da e’lon joylashtirish', en: 'Post a listing — Makon' },
  'Хороший объект заслуживает внимания.': { uz: 'Yaxshi obyekt e’tiborga loyiq.', en: 'A great property deserves attention.' },
  'Подготовьте объявление в несколько простых шагов.': { uz: 'E’lonni bir necha oddiy qadamda tayyorlang.', en: 'Create a listing in a few simple steps.' },
  'Что вы хотите сделать?': { uz: 'Nima qilmoqchisiz?', en: 'What would you like to do?' },
  'Какой это объект?': { uz: 'Bu qanday obyekt?', en: 'What type of property is it?' },
  'Где находится объект?': { uz: 'Obyekt qayerda joylashgan?', en: 'Where is the property located?' },
  'Добавьте характеристики.': { uz: 'Xususiyatlarni kiriting.', en: 'Add the property details.' },
  'Какую цену вы рассматриваете?': { uz: 'Qanday narx belgilaysiz?', en: 'What price are you considering?' },
  'Покажите объект.': { uz: 'Obyektni ko‘rsating.', en: 'Show your property.' },
  'Расскажите о своём объекте.': { uz: 'Obyektingiz haqida ma’lumot bering.', en: 'Tell us about your property.' },
  'Как с вами связаться?': { uz: 'Siz bilan qanday bog‘lanish mumkin?', en: 'How can people contact you?' },
  'Проверьте объявление.': { uz: 'E’lonni tekshiring.', en: 'Review your listing.' },
  'Продолжить': { uz: 'Davom etish', en: 'Continue' },
  'Назад': { uz: 'Orqaga', en: 'Back' },
  'Опубликовать объявление': { uz: 'E’lonni joylashtirish', en: 'Publish listing' },
  'Номер телефона': { uz: 'Telefon raqami', en: 'Phone number' },
  'Выберите фотографии': { uz: 'Suratlarni tanlang', en: 'Choose photos' },
  'Хорошее состояние': { uz: 'Yaxshi holatda', en: 'Good condition' },
  'Свежий ремонт': { uz: 'Yangi ta’mir', en: 'Recently renovated' },
  'Дизайнерский ремонт': { uz: 'Dizayner ta’miri', en: 'Designer renovation' },
  'Под отделку': { uz: 'Ta’mirlash talab etiladi', en: 'Needs finishing' },
  'Сохранить изменения': { uz: 'O‘zgarishlarni saqlash', en: 'Save changes' },
  'Сохранить настройки': { uz: 'Sozlamalarni saqlash', en: 'Save settings' },
  'Личные данные': { uz: 'Shaxsiy ma’lumotlar', en: 'Personal details' },
  'Мой профиль': { uz: 'Mening profilim', en: 'My profile' },
  'Обзор': { uz: 'Umumiy ko‘rinish', en: 'Overview' },
  'Мои объявления': { uz: 'Mening e’lonlarim', en: 'My listings' },
  'Мои оценки': { uz: 'Mening baholarim', en: 'My valuations' },
  'Мои подборки': { uz: 'Mening to‘plamlarim', en: 'My collections' },
  'Сообщения': { uz: 'Xabarlar', en: 'Messages' },
  'Настройки': { uz: 'Sozlamalar', en: 'Settings' },
  'Сохранённые поиски': { uz: 'Saqlangan qidiruvlar', en: 'Saved searches' },
  'Пароль': { uz: 'Parol', en: 'Password' },
  'Повторите пароль': { uz: 'Parolni qayta kiriting', en: 'Confirm password' },
  'Создать аккаунт': { uz: 'Hisob yaratish', en: 'Create account' },
  'Вход в аккаунт': { uz: 'Hisobga kirish', en: 'Sign in to your account' },
  'Зарегистрироваться': { uz: 'Ro‘yxatdan o‘tish', en: 'Sign up' },
  'Перейти в кабинет': { uz: 'Kabinetga o‘tish', en: 'Go to account' },
  'Широта': { uz: 'Kenglik', en: 'Latitude' },
  'Долгота': { uz: 'Uzunlik', en: 'Longitude' },
  'Открыть объявление': { uz: 'E’lonni ochish', en: 'Open listing' },
  'Укажите точку объекта на карте.': { uz: 'Xaritada obyekt joyini belgilang.', en: 'Select the property location on the map.' },
  'Рады видеть': { uz: 'Sizni ko‘rganimizdan xursandmiz', en: 'Welcome back' },
  'Что будем делать сегодня?': { uz: 'Bugun nima qilamiz?', en: 'What would you like to do today?' },
  'Добавить объявление': { uz: 'E’lon qo‘shish', en: 'Add a listing' },
  'Профиль сохранён на этом устройстве.': { uz: 'Profil ushbu qurilmada saqlandi.', en: 'Profile saved on this device.' },
  'Настройки сохранены.': { uz: 'Sozlamalar saqlandi.', en: 'Settings saved.' },
  'Все пользовательские данные остаются в localStorage браузера.': { uz: 'Foydalanuvchi ma’lumotlari brauzerda saqlanadi.', en: 'User data stays in this browser.' },
  'Выберите точку объекта на OpenStreetMap': { uz: 'OpenStreetMap’da obyekt joyini tanlang', en: 'Select the property location on OpenStreetMap' },
  'Карта © OpenStreetMap.': { uz: 'Xarita © OpenStreetMap.', en: 'Map © OpenStreetMap.' },
  'Для этих городов пока нет координат, поэтому отметки не показаны.': { uz: 'Bu shaharlar uchun hozircha koordinatalar yo‘q, shu sababli belgilar ko‘rsatilmaydi.', en: 'Coordinates are not available for these cities, so no markers are shown.' },
  'Примерное расположение в центре города; это не точный адрес.': { uz: 'Shahar markazidagi taxminiy joylashuv; bu aniq manzil emas.', en: 'Approximate city-center location; this is not an exact address.' },
  'Помогаем находить место, которое станет вашим. Недвижимость Узбекистана — с вниманием к деталям.': { uz: 'O‘zingizga mos maskanni topishga yordam beramiz. O‘zbekiston ko‘chmas mulki — har bir detalga e’tibor bilan.', en: 'We help you find a place to call your own. Uzbekistan real estate, with attention to every detail.' },
  'Продать недвижимость': { uz: 'Ko‘chmas mulkni sotish', en: 'Sell a property' },
  'Сдать в аренду': { uz: 'Ijaraga berish', en: 'Rent out a property' },
  'Демонстрационный проект.': { uz: 'Namoyish loyihasi.', en: 'Demo project.' },
  'Цены и объявления приведены в учебных целях.': { uz: 'Narxlar va e’lonlar faqat namoyish uchun keltirilgan.', en: 'Prices and listings are for demonstration only.' },
  'Помогаем находить место, которое станет вашим.': { uz: 'O‘zingizga mos maskanni topishga yordam beramiz.', en: 'We help you find a place to call your own.' },
  'Найдите место, которое станет вашим.': { uz: 'O‘zingizga mos maskan toping.', en: 'Find a place to call your own.' },
  'Покупайте, продавайте и арендуйте. Оценивайте недвижимость и находите свой вариант по-настоящему удобно.': { uz: 'Sotib oling, soting yoki ijaraga oling. Ko‘chmas mulkni baholang va o‘zingizga mos variantni qulay toping.', en: 'Buy, sell, rent, and value property to find the right option with ease.' },
  'объекта в каталоге': { uz: 'ta obyekt katalogda', en: 'properties listed' },
  'по всему Узбекистану': { uz: 'O‘zbekiston bo‘ylab', en: 'across Uzbekistan' },
  'Ваш выбор без лишней суеты': { uz: 'Ortiqcha tashvishsiz tanlov', en: 'Your choice, without the hassle' },
  'Город возможностей': { uz: 'Imkoniyatlar shahri', en: 'A city of opportunity' },
  'Любой район': { uz: 'Istalgan tuman', en: 'Any district' },
  'Тип объекта': { uz: 'Obyekt turi', en: 'Property type' },
  'Цена от, $': { uz: 'Narx, $ dan', en: 'Price from, $' },
  'Цена до, $': { uz: 'Narx, $ gacha', en: 'Price up to, $' },
  'Любая': { uz: 'Istalgan', en: 'Any' },
  'Для первого дома, новых планов, бизнеса или инвестиций.': { uz: 'Birinchi uyingiz, yangi rejalaringiz, biznes yoki sarmoya uchun.', en: 'For a first home, new plans, business, or investment.' },
  'Разные города и сценарии — чтобы быстрее понять, что вам подходит.': { uz: 'Turli shaharlar va imkoniyatlar — sizga mosini tezroq topish uchun.', en: 'Different cities and options to help you find what fits.' },
  'Варианты для новых планов': { uz: 'Yangi rejalar uchun variantlar', en: 'Options for your next plans' },
  'Несколько интересных объектов в разных городах Узбекистана.': { uz: 'O‘zbekistonning turli shaharlaridagi qiziqarli obyektlar.', en: 'Interesting properties in cities across Uzbekistan.' },
  'Собрать свой подбор': { uz: 'O‘z tanlovingizni tuzing', en: 'Build your own search' },
  'Столица возможностей': { uz: 'Imkoniyatlar poytaxti', en: 'Capital of opportunity' },
  'История и новый ритм': { uz: 'Tarix va yangi sur’at', en: 'History meets a new rhythm' },
  'Город с характером': { uz: 'O‘ziga xos shahar', en: 'A city with character' },
  'Зелёная долина': { uz: 'Yashil vodiy', en: 'The green valley' },
  'Город у подножия гор': { uz: 'Tog‘lar etagidagi shahar', en: 'A city at the foot of the mountains' },
  'Поиск под ваш ритм': { uz: 'Sizga mos qidiruv', en: 'Search at your pace' },
  'Сформулируйте пожелания простыми словами — подбор поможет сузить выбор.': { uz: 'Istaklaringizni oddiy so‘zlar bilan yozing — qidiruv tanlovni toraytiradi.', en: 'Describe what you want in plain language and narrow down the options.' },
  'Ориентир по стоимости': { uz: 'Taxminiy narx', en: 'Price estimate' },
  'Получите демонстрационную оценку по ключевым характеристикам объекта.': { uz: 'Obyektning asosiy xususiyatlari bo‘yicha taxminiy narx oling.', en: 'Get an indicative valuation based on key property details.' },
  'Детали под рукой': { uz: 'Barcha tafsilotlar yoningizda', en: 'All the details at hand' },
  'Сравнивайте параметры, сохраняйте варианты и возвращайтесь к ним позже.': { uz: 'Xususiyatlarni solishtiring, variantlarni saqlang va ularga keyin qayting.', en: 'Compare details, save options, and come back to them later.' },
  'Меньше лишних шагов': { uz: 'Ortiqcha qadamlar kamroq', en: 'Fewer unnecessary steps' },
  'Каталог, оценка и публикация объявления собраны в едином пространстве.': { uz: 'Katalog, baholash va e’lon joylashtirish bir joyda.', en: 'Search, valuation, and listing tools in one place.' },
  'Ваш следующий адрес': { uz: 'Keyingi manzilingiz', en: 'Your next address' },
  'Решение с ясностью': { uz: 'Aniq qaror', en: 'Decide with clarity' },
  'Сопоставьте ключевые детали и выберите то, что вам ближе.': { uz: 'Asosiy tafsilotlarni solishtirib, o‘zingizga ma’qulini tanlang.', en: 'Compare the key details and choose what suits you best.' },
  'Можно сравнить до четырёх вариантов': { uz: 'To‘rttagacha variantni solishtirish mumkin', en: 'Compare up to four options' },
  'Характеристика': { uz: 'Xususiyat', en: 'Feature' },
  'Цена за м²': { uz: '1 m² narxi', en: 'Price per m²' },
  'Сделка': { uz: 'Bitim', en: 'Deal' },
  'Этажность': { uz: 'Qavatlar soni', en: 'Number of floors' },
  'Статус': { uz: 'Holati', en: 'Status' },
  'Убрать': { uz: 'Olib tashlash', en: 'Remove' },
  'На карточке нажмите значок сравнения. Здесь можно сопоставить до четырёх объявлений.': { uz: 'Kartadagi solishtirish belgisini bosing. Bu yerda to‘rttagacha e’lonni solishtirish mumkin.', en: 'Select the compare icon on a listing. You can compare up to four properties here.' },
  'Сохранённые объявления всегда будут здесь.': { uz: 'Saqlangan e’lonlaringiz shu yerda ko‘rinadi.', en: 'Your saved listings will be here.' },
  'Отметьте сердечком понравившийся объект — так вы сможете легко вернуться к нему.': { uz: 'Yoqtirgan obyektni yurakcha bilan belgilang — keyin unga oson qaytasiz.', en: 'Tap the heart on a listing to easily find it again.' },
  'Ваш выбор': { uz: 'Sizning tanlovingiz', en: 'Your picks' },
  'Ваше пространство': { uz: 'Sizning makoningiz', en: 'Your space' },
  'Демонстрационный профиль — данные хранятся в этом браузере.': { uz: 'Demo profil — ma’lumotlar ushbu brauzerda saqlanadi.', en: 'Demo profile — data is stored in this browser.' },
  'Демо-аккаунт': { uz: 'Demo hisob', en: 'Demo account' },
  'Быстрый доступ': { uz: 'Tezkor kirish', en: 'Quick access' },
  'Оценок пока нет': { uz: 'Hozircha baholar yo‘q', en: 'No valuations yet' },
  'Объявлений пока нет': { uz: 'Hozircha e’lonlar yo‘q', en: 'No listings yet' },
  'Публикация в прототипе сохраняется только в браузере.': { uz: 'Prototipdagi e’lonlar faqat brauzerda saqlanadi.', en: 'Listings in this prototype are saved only in the browser.' },
  'Сохранённые объекты': { uz: 'Saqlangan obyektlar', en: 'Saved properties' },
  'История расчётов': { uz: 'Hisob-kitoblar tarixi', en: 'Valuation history' },
  'Сообщения представлены как примеры интерфейса; отправка пока не подключена.': { uz: 'Xabarlar interfeys namunasi; yuborish imkoniyati hali ulanmagan.', en: 'Messages are examples; sending is not connected yet.' },
  'Уведомления о новых объектах': { uz: 'Yangi obyektlar haqida bildirishnomalar', en: 'Notifications about new listings' },
  'Сохранять поисковые фильтры': { uz: 'Qidiruv filtrlarini saqlash', en: 'Save search filters' },
  'Демонстрационный расчёт': { uz: 'Demo hisob-kitob', en: 'Demo estimate' },
  'Предварительный ориентир': { uz: 'Dastlabki taxminiy narx', en: 'Preliminary estimate' },
  'Диапазон:': { uz: 'Oraliq:', en: 'Range:' },
  'Похожие объявления': { uz: 'O‘xshash e’lonlar', en: 'Similar listings' },
  'Как получился ориентир': { uz: 'Taxmin qanday hisoblandi', en: 'How the estimate was calculated' },
  'Демонстрационный профиль': { uz: 'Demo profil', en: 'Demo profile' },
  'Категория': { uz: 'Toifa', en: 'Category' },
  'Умный подбор · демо': { uz: 'Aqlli tanlov · demo', en: 'Smart search · demo' },
  'Подбор учитывает слова в запросе и демонстрационные объявления в каталоге.': { uz: 'Tanlov so‘rovdagi so‘zlar va katalogdagi demo e’lonlarga asoslanadi.', en: 'Search matches your words against sample listings in the catalog.' },
  'Любой бюджет': { uz: 'Istalgan byudjet', en: 'Any budget' },
  'Опишите свой идеальный вариант…': { uz: 'O‘zingiz istagan variantni tasvirlang…', en: 'Describe your ideal property…' },
  'Хорошо, начнём новый подбор.': { uz: 'Yaxshi, yangi qidiruvni boshlaymiz.', en: 'Let’s start a new search.' },
  'Привет! Помогу найти недвижимость, которая подходит именно вам.': { uz: 'Salom! Sizga mos ko‘chmas mulkni topishga yordam beraman.', en: 'Hi! I can help you find a property that suits you.' },
  'Напишите, что важно — например, тип жилья, город и бюджет.': { uz: 'Siz uchun muhim jihatlarni yozing — masalan, uy turi, shahar va byudjet.', en: 'Tell us what matters to you, such as property type, city, and budget.' },
  'Поиск по тексту и демонстрационным данным': { uz: 'Matn va demo ma’lumotlar bo‘yicha qidiruv', en: 'Search sample listings by text' },
  'Войти, чтобы пользоваться личным кабинетом и своими объявлениями.': { uz: 'Shaxsiy kabinet va e’lonlaringizdan foydalanish uchun tizimga kiring.', en: 'Sign in to access your account and listings.' },
  'Формат номера Узбекистана': { uz: 'O‘zbekiston telefon raqami formati', en: 'Uzbekistan phone number format' },
  'Файл хранится в браузере в сжатом виде. Пароль здесь не хранится.': { uz: 'Fayl brauzerda siqilgan holda saqlanadi. Parol saqlanmaydi.', en: 'The image is compressed and stored in this browser. Passwords are not stored.' },
  'Сохранить URL': { uz: 'URL’ni saqlash', en: 'Save URL' },
  'Фото профиля': { uz: 'Profil surati', en: 'Profile photo' },
  'Введите корректный URL изображения.': { uz: 'Rasmning to‘g‘ri URL manzilini kiriting.', en: 'Enter a valid image URL.' },
  'Фото профиля сохранено.': { uz: 'Profil surati saqlandi.', en: 'Profile photo saved.' },
  'Данные не сохранены.': { uz: 'Ma’lumotlar saqlanmadi.', en: 'Your data was not saved.' },
  'Формат номера Узбекистана: +998 90 123 45 67.': { uz: 'O‘zbekiston raqami formati: +998 90 123 45 67.', en: 'Uzbekistan phone format: +998 90 123 45 67.' },
  'Не менее 8 символов': { uz: 'Kamida 8 ta belgi', en: 'At least 8 characters' },
  'Выберите место объекта на OpenStreetMap': { uz: 'OpenStreetMap’da obyekt joyini tanlang', en: 'Choose the property location on OpenStreetMap' },
  'Карта загружается…': { uz: 'Xarita yuklanmoqda…', en: 'Loading map…' },
  'Точный адрес виден только в опубликованном демонстрационном объявлении.': { uz: 'Aniq manzil faqat e’lonning demo ko‘rinishida ko‘rsatiladi.', en: 'The exact address is shown only in the published demo listing.' }
  ,
  'Язык сайта': { uz: 'Sayt tili', en: 'Site language' },
  'Основная навигация': { uz: 'Asosiy menyu', en: 'Main navigation' },
  'Перейти к содержимому': { uz: 'Asosiy mazmunga o‘tish', en: 'Skip to content' },
  'Каталог недвижимости — Makon': { uz: 'Ko‘chmas mulk katalogi — Makon', en: 'Property listings — Makon' },
  'Объявление — Makon': { uz: 'E’lon — Makon', en: 'Property listing — Makon' },
  'Избранное — Makon': { uz: 'Saralanganlar — Makon', en: 'Favorites — Makon' },
  'Сравнение объектов — Makon': { uz: 'Obyektlarni solishtirish — Makon', en: 'Compare properties — Makon' },
  'Умный подбор — Makon': { uz: 'Aqlli tanlov — Makon', en: 'Smart search — Makon' },
  'Личный кабинет — Makon': { uz: 'Shaxsiy kabinet — Makon', en: 'My account — Makon' },
  'Оценка недвижимости — Makon': { uz: 'Ko‘chmas mulkni baholash — Makon', en: 'Property valuation — Makon' },
  'Проверено': { uz: 'Tekshirilgan', en: 'Verified' },
  'Новое': { uz: 'Yangi', en: 'New' },
  'Выгодная цена': { uz: 'Qulay narx', en: 'Great price' },
  'Объявление': { uz: 'E’lon', en: 'Listing' },
  'комн.': { uz: 'xona', en: 'rooms' },
  'комнаты': { uz: 'xona', en: 'rooms' },
  'Главное об объекте': { uz: 'Obyekt haqida asosiy ma’lumot', en: 'Property overview' },
  'Об объекте': { uz: 'Obyekt haqida', en: 'About this property' },
  'Характеристики': { uz: 'Xususiyatlar', en: 'Features' },
  'Расположение': { uz: 'Joylashuv', en: 'Location' },
  'Похожие предложения': { uz: 'O‘xshash takliflar', en: 'Similar listings' },
  'Опубликовано': { uz: 'Joylashtirilgan sana', en: 'Published' },
  'Сохранено': { uz: 'Saqlandi', en: 'Saved' },
  'В избранное': { uz: 'Saralanganlarga', en: 'Add to favorites' },
  'Сравнить': { uz: 'Solishtirish', en: 'Compare' },
  'Позвонить': { uz: 'Qo‘ng‘iroq qilish', en: 'Call' },
  'Написать сообщение': { uz: 'Xabar yozish', en: 'Send a message' },
  'Объявление не найдено': { uz: 'E’lon topilmadi', en: 'Listing not found' },
  'Открыть каталог': { uz: 'Katalogni ochish', en: 'Browse listings' },
  'Фотографии объекта': { uz: 'Obyekt suratlari', en: 'Property photos' },
  'Смотреть фото': { uz: 'Suratlarni ko‘rish', en: 'View photos' },
  'Количество комнат': { uz: 'Xonalar soni', en: 'Number of rooms' },
  'Этажность дома': { uz: 'Uy qavatlari soni', en: 'Building floors' },
  'Новый': { uz: 'Yangi', en: 'New' },
  'Рабочее состояние': { uz: 'Ishchi holati', en: 'Functional condition' },
  'Введите город': { uz: 'Shaharni kiriting', en: 'Enter a city' },
  'Например, Ташкент': { uz: 'Masalan, Toshkent', en: 'For example, Tashkent' },
  'Например, Юнусабад': { uz: 'Masalan, Yunusobod', en: 'For example, Yunusabad' },
  'Например, Мирабад': { uz: 'Masalan, Mirobod', en: 'For example, Mirobod' },
  'Например, 82': { uz: 'Masalan, 82', en: 'For example, 82' },
  'Например, 85': { uz: 'Masalan, 85', en: 'For example, 85' },
  'Например, 120 000': { uz: 'Masalan, 120 000', en: 'For example, 120,000' },
  'Другая недвижимость': { uz: 'Boshqa ko‘chmas mulk', en: 'Other property' },
  'Дом с тихим садом и террасой': { uz: 'Sokin bog‘ va ayvonli uy', en: 'House with a quiet garden and terrace' },
  'Светлая квартира с видом на город': { uz: 'Shahar manzarali yorug‘ kvartira', en: 'Bright apartment with city views' },
  'Светлая квартира рядом с парком': { uz: 'Bog‘ yonidagi yorug‘ kvartira', en: 'Bright apartment near the park' },
  'С чего начнём?': { uz: 'Nimadan boshlaymiz?', en: 'Where should we start?' },
  'Проверьте данные объявления': { uz: 'E’lon ma’lumotlarini tekshiring', en: 'Review your listing details' },
  'Выберите формат объявления.': { uz: 'E’lon formatini tanlang.', en: 'Choose a listing format.' },
  'Тип недвижимости поможет показать объявление нужным людям.': { uz: 'Ko‘chmas mulk turi e’lonni kerakli odamlarga ko‘rsatishga yordam beradi.', en: 'The property type helps show your listing to the right people.' },
  'Продать': { uz: 'Sotish', en: 'Sell' },
  'Найти покупателя': { uz: 'Xaridor topish', en: 'Find a buyer' },
  'Долгосрочное размещение': { uz: 'Uzoq muddatli ijara', en: 'Long-term rental' },
  'Краткосрочная сдача': { uz: 'Qisqa muddatli ijara', en: 'Short-term rental' },
  'Участок под ваши планы': { uz: 'Rejalaringiz uchun yer', en: 'Land for your plans' },
  'Рабочее пространство': { uz: 'Ish joyi', en: 'Workspace' },
  'Адрес или ориентир': { uz: 'Manzil yoki mo‘ljal', en: 'Address or landmark' },
  'Улица, жилой комплекс или ближайший ориентир': { uz: 'Ko‘cha, turar joy majmuasi yoki yaqin mo‘ljal', en: 'Street, residential complex, or nearby landmark' },
  'Нажмите на карту, чтобы отметить точное место объекта. Без выбранной точки объявление не появится на карте каталога.': { uz: 'Obyekt joyini belgilash uchun xaritani bosing. Belgilanmagan e’lon katalog xaritasida ko‘rsatilmaydi.', en: 'Click the map to mark the property location. Listings without a pin will not appear on the catalog map.' },
  'Найдите адрес или нажмите на карту, чтобы поставить метку. Поиск отправляет адрес в OpenStreetMap для определения координат.': { uz: 'Manzilni qidiring yoki xaritada belgilang. Qidiruv koordinatalarni aniqlash uchun manzilni OpenStreetMap’ga yuboradi.', en: 'Search for an address or drop a pin on the map. Address search sends it to OpenStreetMap to find coordinates.' },
  'Найти на карте': { uz: 'Xaritadan topish', en: 'Find on map' },
  'Сначала укажите адрес или ориентир.': { uz: 'Avval manzil yoki mo‘ljalni kiriting.', en: 'Enter an address or landmark first.' },
  'Адрес найден, отметка установлена на карте.': { uz: 'Manzil topildi va xaritada belgilandi.', en: 'Address found and marked on the map.' },
  'Не удалось найти этот адрес.': { uz: 'Bu manzilni topib bo‘lmadi.', en: 'Could not find that address.' },
  'Размер каждого видео не должен превышать 10 МБ.': { uz: 'Har bir video hajmi 10 MB dan oshmasligi kerak.', en: 'Each video must be no larger than 10 MB.' },
  'Размер фотографии не должен превышать 15 МБ.': { uz: 'Surat hajmi 15 MB dan oshmasligi kerak.', en: 'Each photo must be no larger than 15 MB.' },
  'Поддерживаются только PNG, JPG, WebP, GIF, MP4, MOV и WebM.': { uz: 'Faqat PNG, JPG, WebP, GIF, MP4, MOV va WebM formatlari qo‘llab-quvvatlanadi.', en: 'Only PNG, JPG, WebP, GIF, MP4, MOV, and WebM files are supported.' },
  'Можно добавить не более 10 фото или видео.': { uz: '10 tagacha surat yoki video qo‘shish mumkin.', en: 'You can add up to 10 photos or videos.' },
  'Выберите не более 10 фото или видео поддерживаемого формата.': { uz: 'Qo‘llab-quvvatlanadigan formatdagi 10 tagacha surat yoki video tanlang.', en: 'Choose up to 10 photos or videos in a supported format.' },
  'Объявление опубликовано, но не удалось обновить список в личном кабинете.': { uz: 'E’lon joylandi, ammo shaxsiy kabinetdagi ro‘yxat yangilanmadi.', en: 'The listing was published, but your account list could not be updated.' },
  'Слишком много объявлений. Попробуйте позже.': { uz: 'E’lonlar soni juda ko‘p. Keyinroq urinib ko‘ring.', en: 'Too many listings. Please try again later.' },
  'Подождите секунду перед следующим поиском адреса.': { uz: 'Keyingi manzilni qidirishdan oldin bir soniya kuting.', en: 'Wait a second before searching for another address.' },
  'Введите адрес (до 300 символов).': { uz: 'Manzilni kiriting (300 ta belgigacha).', en: 'Enter an address (up to 300 characters).' },
  'Размер запроса превышает 80 МБ.': { uz: 'So‘rov hajmi 80 MB dan oshadi.', en: 'Request size exceeds 80 MB.' },
  'Добавьте фотографии и видео — первое медиа станет обложкой.': { uz: 'Surat va videolarni qo‘shing — birinchi fayl muqova bo‘ladi.', en: 'Add photos and videos; the first media file will be the cover.' },
  'Выберите фотографии или видео': { uz: 'Surat yoki video tanlang', en: 'Choose photos or videos' },
  'Видео до 10 МБ каждое; фотографии — до 15 МБ. Медиа появится в каталоге после публикации.': { uz: 'Har bir video 10 MB gacha, surat 15 MB gacha. Fayllar e’lon joylangach katalogda ko‘rinadi.', en: 'Videos up to 10 MB each; photos up to 15 MB. Media appears in the catalog after publishing.' },
  'Пока нет объявлений': { uz: 'Hozircha e’lonlar yo‘q', en: 'No listings yet' },
  'Разместите объявление или измените фильтры.': { uz: 'E’lon joylang yoki filtrlarni o‘zgartiring.', en: 'Post a listing or change the filters.' },
  'Объявлений в каталоге': { uz: 'katalogdagi e’lonlar', en: 'listings in the catalog' },
  'Объявления владельцев': { uz: 'Mulk egalarining e’lonlari', en: 'Owner listings' },
  'Актуальные объекты, добавленные пользователями Makon.': { uz: 'Makon foydalanuvchilari joylagan ko‘chmas mulk e’lonlari.', en: 'Property listings posted by Makon users.' },
  'Здесь появятся объявления владельцев': { uz: 'Mulk egalarining e’lonlari shu yerda ko‘rinadi', en: 'Owner listings will appear here' },
  'На интерактивной карте': { uz: 'Interaktiv xaritada', en: 'On the interactive map' },
  'для каждого объявления': { uz: 'har bir e’lon uchun', en: 'for every listing' },
  'Объявление опубликовано и появится в общем каталоге.': { uz: 'E’lon joylandi va umumiy katalogda ko‘rinadi.', en: 'Your listing is published and will appear in the shared catalog.' },
  'Новое объявление': { uz: 'Yangi e’lon', en: 'New listing' },
  'Выберите тип размещения, чтобы продолжить.': { uz: 'Davom etish uchun e’lon turini tanlang.', en: 'Choose a listing type to continue.' },
  'Выберите тип недвижимости.': { uz: 'Ko‘chmas mulk turini tanlang.', en: 'Choose a property type.' },
  'Создать ещё одно': { uz: 'Yana bitta yaratish', en: 'Create another' },
  'Объявление размещено.': { uz: 'E’lon joylashtirildi.', en: 'Listing published.' },
  'Фото не добавлены': { uz: 'Suratlar qo‘shilmagan', en: 'No photos added' },
  'Проверьте номер Узбекистана: +998 90 123 45 67 или 90 123 45 67.': { uz: 'O‘zbekiston raqamini tekshiring: +998 90 123 45 67 yoki 90 123 45 67.', en: 'Enter a valid Uzbekistan number: +998 90 123 45 67 or 90 123 45 67.' },
  'Пароли не совпадают.': { uz: 'Parollar mos kelmaydi.', en: 'Passwords do not match.' },
  'Форма готова, но сервис авторизации пока не подключён. Данные не сохранены.': { uz: 'Forma tayyor, ammo autentifikatsiya xizmati ulanmagan. Ma’lumotlar saqlanmadi.', en: 'The form is ready, but authentication is not connected. No data was saved.' },
  'Демонстрационная форма: номер проверяется по формату, но SMS-код и настоящая авторизация не подключены. Не вводите настоящий пароль — он не сохраняется.': { uz: 'Demo forma: raqam formati tekshiriladi, ammo SMS-kod va haqiqiy kirish ulanmagan. Haqiqiy parolingizni kiritmang — u saqlanmaydi.', en: 'Demo form: phone format is checked, but SMS and real authentication are not connected. Do not enter a real password; it is not saved.' },
  'Войдите, чтобы пользоваться личным кабинетом и своими объявлениями.': { uz: 'Shaxsiy kabinet va e’lonlaringizdan foydalanish uchun tizimga kiring.', en: 'Sign in to access your account and listings.' },
  'Впервые на Makon?': { uz: 'Makon’da yangimisiz?', en: 'New to Makon?' },
  'Уже есть аккаунт?': { uz: 'Hisobingiz bormi?', en: 'Already have an account?' },
  'Русский язык включён. Переводы на узбекский и английский появятся после локализации.': { uz: 'O‘zbek tili tanlandi.', en: 'English selected.' },
  'Не удалось сохранить изменения.': { uz: 'O‘zgarishlarni saqlab bo‘lmadi.', en: 'Could not save your changes.' },
  'Браузер не смог обработать это изображение.': { uz: 'Brauzer bu rasmni qayta ishlay olmadi.', en: 'The browser could not process this image.' },
  'Не удалось прочитать файл.': { uz: 'Faylni o‘qib bo‘lmadi.', en: 'Could not read the file.' },
  'Файл не является поддерживаемым изображением.': { uz: 'Bu rasm formati qo‘llab-quvvatlanmaydi.', en: 'This image format is not supported.' },
  'Не удалось сохранить фото. Попробуйте изображение меньшего размера.': { uz: 'Suratni saqlab bo‘lmadi. Kichikroq rasmni sinab ko‘ring.', en: 'Could not save the photo. Try a smaller image.' },
  'Не удалось сохранить профиль в браузере.': { uz: 'Profilni brauzerda saqlab bo‘lmadi.', en: 'Could not save the profile in this browser.' },
  'Вид каталога': { uz: 'Katalog ko‘rinishi', en: 'Listing view' },
  'Демонстрационное расположение объектов. Точная карта появится позже.': { uz: 'Obyektlar joylashuvi demo. Aniq xarita keyinroq qo‘shiladi.', en: 'Demo property locations. An accurate map will be added later.' },
  'Список объектов на карте': { uz: 'Xaritadagi obyektlar ro‘yxati', en: 'Properties on the map' },
  'объект': { uz: 'obyekt', en: 'property' },
  'объектов': { uz: 'obyekt', en: 'properties' },
  'объект сохранён': { uz: 'obyekt saqlandi', en: 'property saved' },
  'объекта сохранено': { uz: 'obyekt saqlandi', en: 'properties saved' },
  'объектов сохранено': { uz: 'obyekt saqlandi', en: 'properties saved' },
  'Объявления по фильтрам': { uz: 'Filtrlar bo‘yicha e’lonlar', en: 'Listings matching filters' },
  '4 и более': { uz: '4 ta va ko‘proq', en: '4 or more' },
  'Любое': { uz: 'Istalgan', en: 'Any' },
  'С ремонтом': { uz: 'Ta’mirlangan', en: 'Renovated' },
  'Не первый': { uz: 'Birinchi qavat emas', en: 'Not on the ground floor' },
  'Не последний': { uz: 'Oxirgi qavat emas', en: 'Not on the top floor' },
  'Ташкент': { uz: 'Toshkent', en: 'Tashkent' },
  'Самарканд': { uz: 'Samarqand', en: 'Samarkand' },
  'Бухара': { uz: 'Buxoro', en: 'Bukhara' },
  'Фергана': { uz: 'Farg‘ona', en: 'Fergana' },
  'Наманган': { uz: 'Namangan', en: 'Namangan' },
  'Андижан': { uz: 'Andijon', en: 'Andijan' },
  'Нукус': { uz: 'Nukus', en: 'Nukus' },
  'Юнусабад': { uz: 'Yunusobod', en: 'Yunusabad' },
  'Мирзо-Улугбек': { uz: 'Mirzo Ulug‘bek', en: 'Mirzo Ulugbek' },
  'Согдиана': { uz: 'So‘g‘diyona', en: 'Sogdiana' },
  'Мирабад': { uz: 'Mirobod', en: 'Mirobod' },
  'Рабат': { uz: 'Rabot', en: 'Rabat' },
  'Янги аср': { uz: 'Yangi asr', en: 'Yangi Asr' },
  'Чиланзар': { uz: 'Chilonzor', en: 'Chilanzar' },
  'Шайхантахур': { uz: 'Shayxontohur', en: 'Shaykhantahur' },
  'Яккасарай': { uz: 'Yakkasaroy', en: 'Yakkasaray' },
  'Давлатобод': { uz: 'Davlatobod', en: 'Davlatabad' },
  'Богишамол': { uz: 'Bog‘ishamol', en: 'Bogishamol' },
  'Гиждуванская': { uz: 'G‘ijduvon', en: 'Gijduvan' },
  'Яшнабад': { uz: 'Yashnobod', en: 'Yashnabad' },
  'Конигил': { uz: 'Konigil', en: 'Konigil' },
  'Регистан': { uz: 'Registon', en: 'Registan' },
  'Центр': { uz: 'Markaz', en: 'Center' },
  'Дослык': { uz: 'Do‘stlik', en: 'Doslik' },
  'Центральный': { uz: 'Markaziy', en: 'Central' },
  'Старый город': { uz: 'Eski shahar', en: 'Old Town' },
  'Сергели': { uz: 'Sergeli', en: 'Sergeli' },
  'Популярное': { uz: 'Ommabop', en: 'Popular' },
  'Отличное состояние': { uz: 'A’lo holatda', en: 'Excellent condition' },
  'Ровный участок': { uz: 'Tekis yer uchastkasi', en: 'Level plot' },
  'Под строительство': { uz: 'Qurilish uchun', en: 'For construction' },
  'Отделка shell & core': { uz: 'Shell & core holatida', en: 'Shell and core finish' },
  'После ремонта': { uz: 'Ta’mirdan keyin', en: 'Recently renovated' },
  'Коммуникации по границе': { uz: 'Kommunikatsiyalar uchastka chegarasida', en: 'Utilities at the plot boundary' },
  'Мадина Каримова': { uz: 'Madina Karimova', en: 'Madina Karimova' },
  'Азиз Рахимов': { uz: 'Aziz Rahimov', en: 'Aziz Rakhimov' },
  'Дилшод Нуров': { uz: 'Dilshod Nurov', en: 'Dilshod Nurov' },
  'Севара Юсупова': { uz: 'Sevara Yusupova', en: 'Sevara Yusupova' },
  'Бехруз Ахмедов': { uz: 'Behruz Ahmedov', en: 'Behruz Akhmedov' },
  'Собственник': { uz: 'Mulk egasi', en: 'Owner' },
  'Открыть:': { uz: 'Ochish:', en: 'Open:' },
  'Объект не найден': { uz: 'Obyekt topilmadi', en: 'Property not found' },
  'Откройте объявление': { uz: 'E’lonni oching', en: 'Open listing' },
  'Формат номера Узбекистана: +998 90 123 45 67': { uz: 'O‘zbekiston raqami formati: +998 90 123 45 67', en: 'Uzbekistan phone format: +998 90 123 45 67' },
  'Номер Узбекистана': { uz: 'O‘zbekiston raqami', en: 'Uzbekistan phone number' },
  'Открыть меню': { uz: 'Menyuni ochish', en: 'Open menu' },
  'Закрыть': { uz: 'Yopish', en: 'Close' },
  'Makon — главная': { uz: 'Makon — bosh sahifa', en: 'Makon — home' },
  'Демо-подборка': { uz: 'Demo to‘plam', en: 'Sample collection' },
  'Первый дом в Ташкенте': { uz: 'Toshkentdagi ilk uy', en: 'A first home in Tashkent' },
  'Тема и уведомления сервера недоступны в демонстрационной версии.': { uz: 'Demo versiyada mavzu va server bildirishnomalari mavjud emas.', en: 'Themes and server notifications are unavailable in this demo.' },
  'Показывать новые варианты в интерфейсе': { uz: 'Yangi variantlarni interfeysda ko‘rsatish', en: 'Show new options in the interface' },
  'Оставлять параметры каталога на этом устройстве': { uz: 'Katalog parametrlarini ushbu qurilmada saqlash', en: 'Keep catalog filters on this device' },
  'Профиль': { uz: 'Profil', en: 'Profile' },
  'Предпочтения': { uz: 'Afzalliklar', en: 'Preferences' },
  'Активность': { uz: 'Faollik', en: 'Activity' },
  'Переписка': { uz: 'Yozishmalar', en: 'Conversations' },
  'Положение на карте показано схематично для демонстрации.': { uz: 'Xaritadagi joylashuv namoyish uchun sxematik ko‘rsatilgan.', en: 'The map location is illustrative.' },
  'Коммуникации': { uz: 'Kommunikatsiyalar', en: 'Utilities' },
  'Файлы останутся на этом устройстве и не загружаются.': { uz: 'Fayllar ushbu qurilmada qoladi va internetga yuklanmaydi.', en: 'Files stay on this device and are not uploaded.' },
  'Предварительная демонстрационная оценка. Для определения реальной рыночной стоимости необходимы актуальные данные рынка и проверка характеристик объекта.': { uz: 'Bu dastlabki demo bahodir. Haqiqiy bozor qiymatini aniqlash uchun dolzarb bozor ma’lumotlari va obyekt xususiyatlarini tekshirish zarur.', en: 'This is a preliminary sample estimate. Determining a real market value requires current market data and verification of the property details.' },
  'Повторить оценку': { uz: 'Qayta baholash', en: 'Try another estimate' },
  'Расчёт ориентируется на демонстрационные объявления похожего типа. Он поможет начать разговор о цене, но не заменяет профессиональную оценку.': { uz: 'Hisob-kitob o‘xshash turdagi demo e’lonlarga asoslanadi. U narx bo‘yicha suhbatni boshlashga yordam beradi, ammo professional baholash o‘rnini bosmaydi.', en: 'This estimate uses similar sample listings as a starting point for a pricing discussion; it is not a professional valuation.' },
  'Реальные цены на платформе не подключены. Значения ниже — пример интерфейса, а не рыночная статистика.': { uz: 'Platformada haqiqiy narxlar mavjud emas. Quyidagi qiymatlar bozor statistikasi emas, interfeys namunasi.', en: 'Live market prices are not connected. The values below are interface examples, not market statistics.' },
  'Оценка': { uz: 'Baholash', en: 'Valuation' },
  'Оценка объекта': { uz: 'Obyektni baholash', en: 'Property valuation' },
  '© 2026 Makon. Демонстрационный проект.': { uz: '© 2026 Makon. Namoyish loyihasi.', en: '© 2026 Makon. Demo project.' },
  'Имя': { uz: 'Ism', en: 'Name' },
  'Email': { uz: 'Elektron pochta', en: 'Email' },
  'Телефон': { uz: 'Telefon', en: 'Phone' },
  'Разделы кабинета': { uz: 'Kabinet bo‘limlari', en: 'Account sections' },
  'Аватар профиля': { uz: 'Profil avatari', en: 'Profile avatar' },
  'Профиль сохранится локально на этом устройстве.': { uz: 'Profil ushbu qurilmada saqlanadi.', en: 'Your profile is saved locally on this device.' },
  'Действие': { uz: 'Amal', en: 'Action' },
  'Тип': { uz: 'Tur', en: 'Type' },
  'Адрес': { uz: 'Manzil', en: 'Address' },
  'Детали': { uz: 'Tafsilotlar', en: 'Details' },
  'Фото': { uz: 'Suratlar', en: 'Photos' },
  'Описание': { uz: 'Tavsif', en: 'Description' },
  'Контакт': { uz: 'Aloqa', en: 'Contact' },
  'Проверка': { uz: 'Tekshirish', en: 'Review' },
  'Готово': { uz: 'Tayyor', en: 'Done' },
  'Посуточная аренда': { uz: 'Kunlik ijara', en: 'Daily rent' },
  'Сохранить на потом': { uz: 'Keyinroq uchun saqlash', en: 'Save for later' },
  'Площадь участка, м²': { uz: 'Yer maydoni, m²', en: 'Plot area, m²' },
  'Укажите сумму в долларах США. Это демонстрационное объявление.': { uz: 'Summani AQSh dollarida kiriting. Bu demo e’londir.', en: 'Enter the amount in US dollars. This is a sample listing.' },
  'Стоимость, $': { uz: 'Narxi, $', en: 'Price, $' },
  'Добавьте фотографии — первое изображение станет обложкой.': { uz: 'Suratlar qo‘shing — birinchi rasm muqova bo‘ladi.', en: 'Add photos; the first image will be the cover.' },
  'PNG или JPG · можно выбрать несколько': { uz: 'PNG yoki JPG · bir nechta tanlash mumkin', en: 'PNG or JPG · you can select multiple' },
  'Файлы будут показаны только как выбранные названия. Демонстрационная публикация не загружает их в сеть.': { uz: 'Fayllar faqat tanlangan nomlar sifatida ko‘rsatiladi. Demo e’lon ularni internetga yuklamaydi.', en: 'Files are shown by name only. This demo does not upload them.' },
  'Заголовок объявления': { uz: 'E’lon sarlavhasi', en: 'Listing title' },
  'Минимум 20 символов, чтобы покупатели узнали главное.': { uz: 'Xaridorlar asosiy ma’lumotni bilishi uchun kamida 20 ta belgi.', en: 'Use at least 20 characters to give buyers the essentials.' },
  'В прототипе контактные данные сохраняются только в локальном браузере.': { uz: 'Prototipda aloqa ma’lumotlari faqat brauzerda saqlanadi.', en: 'In this prototype, contact details are stored only in this browser.' },
  'Перед публикацией можно вернуться на любой предыдущий шаг.': { uz: 'E’lonni joylashtirishdan oldin istalgan oldingi bosqichga qaytishingiz mumkin.', en: 'You can return to any previous step before publishing.' },
  'Другой город': { uz: 'Boshqa shahar', en: 'Other city' },
  'Новый дом': { uz: 'Yangi uy', en: 'New building' },
  'Лифт': { uz: 'Lift', en: 'Elevator' },
  'Лоджия': { uz: 'Lodjiya', en: 'Enclosed balcony' },
  'Закрытый двор': { uz: 'Yopiq hovli', en: 'Gated courtyard' },
  'Кондиционер': { uz: 'Konditsioner', en: 'Air conditioning' },
  'Газ': { uz: 'Gaz', en: 'Gas' },
  'Парковка': { uz: 'Avtoturargoh', en: 'Parking' },
  'Терраса': { uz: 'Ayvon', en: 'Terrace' },
  'Подземная парковка': { uz: 'Yerosti avtoturargohi', en: 'Underground parking' },
  'Охрана': { uz: 'Qo‘riqlash', en: 'Security' },
  'Мебель': { uz: 'Mebel', en: 'Furniture' },
  'Интернет': { uz: 'Internet', en: 'Internet' },
  'Без комиссии': { uz: 'Komissiyasiz', en: 'No commission' },
  'Вода': { uz: 'Suv', en: 'Water' },
  'Электричество': { uz: 'Elektr', en: 'Electricity' },
  'Балкон': { uz: 'Balkon', en: 'Balcony' },
  'Тихий двор': { uz: 'Sokin hovli', en: 'Quiet courtyard' },
  'Рядом парк': { uz: 'Park yaqinida', en: 'Near a park' },
  'Кладовая': { uz: 'Omborxona', en: 'Storage room' },
  'Домофон': { uz: 'Domofon', en: 'Intercom' },
  'Бизнес-центр': { uz: 'Biznes markazi', en: 'Business center' },
  'Рецепция': { uz: 'Qabulxona', en: 'Reception' },
  'Асфальтированный подъезд': { uz: 'Asfaltlangan yo‘l', en: 'Paved access road' },
  'Газ рядом': { uz: 'Gaz tarmog‘i yaqin', en: 'Gas nearby' },
  'Вода рядом': { uz: 'Suv tarmog‘i yaqin', en: 'Water nearby' },
  'Грузовой заезд': { uz: 'Yuk mashinalari uchun kirish', en: 'Truck access' },
  'Отопление': { uz: 'Isitish', en: 'Heating' },
  'Закрытый квартал': { uz: 'Yopiq mavze', en: 'Gated community' },
  'Детская площадка': { uz: 'Bolalar maydonchasi', en: 'Playground' },
  'Панорамные окна': { uz: 'Panoramali derazalar', en: 'Panoramic windows' },
  'Круглосуточный доступ': { uz: 'Kechayu kunduz kirish', en: '24/7 access' },
  'Wi-Fi': { uz: 'Wi-Fi', en: 'Wi-Fi' },
  'Кухня': { uz: 'Oshxona', en: 'Kitchen' },
  'Рядом достопримечательности': { uz: 'Diqqatga sazovor joylar yaqinida', en: 'Near local attractions' },
  'Сухое помещение': { uz: 'Quruq xona', en: 'Dry storage' },
  'Долгосрочная аренда': { uz: 'Uzoq muddatli ijara', en: 'Long-term rental' },
  'Летняя кухня': { uz: 'Yozgi oshxona', en: 'Summer kitchen' },
  'Высокие потолки': { uz: 'Baland shiftlar', en: 'High ceilings' },
  'Витрины': { uz: 'Vitrinalar', en: 'Display windows' },
  'Коммуникации рядом': { uz: 'Kommunikatsiyalar yaqin', en: 'Utilities nearby' },
  'Квартира в новом жилом комплексе': { uz: 'Yangi turar joy majmuasidagi kvartira', en: 'Apartment in a new residential complex' },
  'Уютная квартира рядом с бульваром': { uz: 'Xiyobon yaqinidagi shinam kvartira', en: 'Cozy apartment near the boulevard' },
  'Участок для дома в спокойном районе': { uz: 'Sokin hududdagi uy qurish uchun yer', en: 'Residential plot in a quiet neighborhood' },
  'Семейный дом с просторной гостиной': { uz: 'Keng mehmonxonali oilaviy uy', en: 'Family home with a spacious living room' },
  'Гараж в охраняемом кооперативе': { uz: 'Qo‘riqlanadigan garaj kooperatividagi garaj', en: 'Garage in a secure cooperative' },
  'Помещение с витринными окнами': { uz: 'Vitrinali noturar joy', en: 'Commercial space with display windows' },
  'Солнечная квартира с открытой кухней': { uz: 'Ochiq oshxonali quyoshli kvartira', en: 'Sunny apartment with an open kitchen' },
  'Новый коттедж с видом на горы': { uz: 'Tog‘ manzarali yangi kottej', en: 'New cottage with mountain views' },
  'Небольшой офис в деловом центре': { uz: 'Biznes markazidagi kichik ofis', en: 'Small office in a business center' },
  'Участок у главной дороги': { uz: 'Asosiy yo‘l bo‘yidagi yer uchastkasi', en: 'Plot near the main road' },
  'Квартира с балконом у парка': { uz: 'Park yonidagi balkonli kvartira', en: 'Apartment with a balcony near the park' },
  'Складской блок с удобным заездом': { uz: 'Qulay kirish yo‘liga ega ombor', en: 'Warehouse unit with easy vehicle access' },
  'Таунхаус с собственным двориком': { uz: 'Shaxsiy hovlichali taunxaus', en: 'Townhouse with a private courtyard' },
  'Офис с панорамными окнами': { uz: 'Panoramali derazali ofis', en: 'Office with panoramic windows' },
  'Квартира для короткой поездки': { uz: 'Qisqa safar uchun kvartira', en: 'Apartment for a short stay' },
  'Магазин на оживлённой улице': { uz: 'Serqatnov ko‘chadagi do‘kon', en: 'Shop on a busy street' },
  'Уютная студия у университетского квартала': { uz: 'Universitet mavzesi yaqinidagi shinam studiya', en: 'Cozy studio near the university district' },
  'Капитальный гараж у жилого комплекса': { uz: 'Turar joy majmuasi yonidagi mustahkam garaj', en: 'Solid garage near a residential complex' },
  'Дом с большим садом для семьи': { uz: 'Oilaviy katta bog‘li uy', en: 'Family home with a large garden' },
  'Просторная квартира у набережной': { uz: 'Sohil bo‘yidagi keng kvartira', en: 'Spacious apartment near the waterfront' },
  'Шоурум рядом с центральным рынком': { uz: 'Markaziy bozor yaqinidagi shourum', en: 'Showroom near the central market' },
  'Земля для небольшого производства': { uz: 'Kichik ishlab chiqarish uchun yer', en: 'Land for a small production facility' },
  'Просторная квартира с окнами на две стороны, отдельной кухней и большой лоджией. В пешей доступности метро, школа и парк. Дом ухоженный, двор закрытый.': { uz: 'Ikki tomonga qaragan derazalari, alohida oshxonasi va katta lodjiyasi bo‘lgan keng kvartira. Metro, maktab va park piyoda masofada. Uy yaxshi saqlangan, hovli yopiq.', en: 'Spacious apartment with windows on two sides, a separate kitchen, and a large enclosed balcony. Metro, a school, and a park are within walking distance. The building is well maintained with a gated courtyard.' },
  'Тёплый семейный дом с естественным светом, зелёным двором и отдельной летней кухней. Удобный выезд к центру и рядом несколько супермаркетов.': { uz: 'Tabiiy yorug‘likka to‘la, ko‘kalamzor hovli va alohida yozgi oshxonasi bor shinam oilaviy uy. Markazga chiqish qulay, yaqinida bir nechta supermarket bor.', en: 'Warm family home with natural light, a green courtyard, and a separate summer kitchen. Easy access to the city center and several supermarkets nearby.' },
  'Удобная планировка в новом доме с подземной парковкой и благоустроенной территорией. Квартира после строителей, можно оформить интерьер под себя.': { uz: 'Yerosti avtoturargohi va obodonlashtirilgan hududga ega yangi uydagi qulay reja. Ta’mirsiz kvartirani o‘zingizga moslab jihozlashingiz mumkin.', en: 'Well-planned apartment in a new building with underground parking and landscaped grounds. Finished to shell standard, ready for your own interior design.' },
  'Меблированная квартира для долгосрочной аренды. Тихий двор, быстрый интернет, рядом кафе, магазины и остановка.': { uz: 'Uzoq muddatli ijara uchun mebellangan kvartira. Sokin hovli, tezkor internet, yaqinida kafe, do‘konlar va bekat bor.', en: 'Furnished apartment for long-term rent. Quiet courtyard, fast internet, with cafes, shops, and a bus stop nearby.' },
  'Участок правильной формы на жилой улице. Подведены электричество и вода, газ проходит по границе. Документы готовы к сделке.': { uz: 'Turar joy ko‘chasidagi to‘g‘ri shaklli yer uchastkasi. Elektr va suv ulangan, gaz tarmog‘i chegara bo‘ylab o‘tadi. Hujjatlar bitimga tayyor.', en: 'Regular-shaped plot on a residential street. Electricity and water are connected, gas runs along the boundary, and documents are ready for a transaction.' },
  'Практичный двухэтажный дом с уютной гостиной, фруктовыми деревьями во дворе и местом для автомобиля. Рядом рынок и школа.': { uz: 'Shinam mehmonxonasi, hovlisida mevali daraxtlari va mashina joyi bo‘lgan qulay ikki qavatli uy. Yaqinida bozor va maktab bor.', en: 'Practical two-story home with a cozy living room, fruit trees in the courtyard, and parking. A market and school are nearby.' },
  'Капитальный гараж с электричеством в закрытом охраняемом кооперативе. Удобный подъезд, документы в порядке.': { uz: 'Yopiq va qo‘riqlanadigan kooperativdagi elektr tarmog‘iga ulangan mustahkam garaj. Kirish qulay, hujjatlari joyida.', en: 'Solid garage with electricity in a gated, guarded cooperative. Easy access and documentation in order.' },
  'Универсальное помещение на первом этаже жилого комплекса. Подойдёт под шоурум, кофейню или сервисный бизнес.': { uz: 'Turar joy majmuasining birinchi qavatidagi universal joy. Shourum, qahvaxona yoki xizmat ko‘rsatish biznesi uchun mos.', en: 'Versatile ground-floor space in a residential complex, suitable for a showroom, café, or service business.' },
  'Продуманная планировка, кухня-гостиная и мастер-спальня. Дом расположен в одном из самых удобных районов города.': { uz: 'Puxta reja, oshxona-mehmonxona va alohida yotoqxona. Uy shaharning eng qulay hududlaridan birida joylashgan.', en: 'Thoughtful layout with an open kitchen and living area plus a primary bedroom. Located in one of the city’s most convenient neighborhoods.' },
  'Современный коттедж с большим участком и просторной кухней. Подходит для большой семьи, рядом зелёная зона и выезд на объездную дорогу.': { uz: 'Katta yer uchastkasi va keng oshxonali zamonaviy kottej. Katta oila uchun mos; yaqinida yashil hudud va aylanma yo‘lga chiqish bor.', en: 'Modern cottage with a large plot and spacious kitchen. Suits a large family, with green space and a ring-road exit nearby.' },
  'Тихий светлый офис с переговорной зоной в бизнес-центре. Доступ 24/7, рецепция и резервное электропитание.': { uz: 'Biznes markazidagi sokin va yorug‘ ofis, muzokara maydoni bilan. Kecha-kunduz kirish, qabulxona va zaxira elektr ta’minoti mavjud.', en: 'Quiet, bright office with a meeting area in a business center. 24/7 access, reception, and backup power.' },
  'Участок для строительства частного дома в обжитом районе. Ровный рельеф, удобный доступ к коммуникациям и асфальтированной дороге.': { uz: 'Obod hududdagi xususiy uy qurish uchun yer uchastkasi. Tekis relyef, kommunikatsiyalar va asfalt yo‘lga qulay kirish mavjud.', en: 'Plot for a private home in an established neighborhood, with level terrain and easy access to utilities and a paved road.' },
  'Аккуратная квартира с видом на зелёный сквер. Хорошо подойдёт для первого жилья или долгосрочной инвестиции.': { uz: 'Yashil xiyobon manzarali ozoda kvartira. Birinchi uy yoki uzoq muddatli sarmoya uchun mos.', en: 'Well-kept apartment overlooking a green square, suitable as a first home or a long-term investment.' },
  'Сухой склад с высокими воротами и территорией для манёвра грузового транспорта. Подходит для хранения и лёгкого производства.': { uz: 'Baland darvozali va yuk mashinalari manevri uchun maydoni bor quruq ombor. Saqlash va yengil ishlab chiqarish uchun mos.', en: 'Dry warehouse with tall doors and room for trucks to maneuver. Suitable for storage and light manufacturing.' },
  'Компактный таунхаус в спокойном закрытом квартале. У каждого дома своё парковочное место и приватный дворик.': { uz: 'Sokin yopiq mavzedagi ixcham taunxaus. Har bir uy uchun alohida avtoturargoh va shaxsiy hovli bor.', en: 'Compact townhouse in a quiet gated community. Each home has its own parking space and private courtyard.' },
  'Офисный блок с гибкой планировкой и естественным светом. В здании предусмотрены переговорные, кафе и подземная парковка.': { uz: 'Moslashuvchan reja va tabiiy yorug‘likka ega ofis bloki. Binoda muzokara xonalari, kafe va yerosti avtoturargohi bor.', en: 'Office suite with a flexible layout and natural light. The building includes meeting rooms, a café, and underground parking.' },
  'Стильные апартаменты в исторической части города с оборудованной кухней и быстрым Wi-Fi. Стоимость указана за сутки.': { uz: 'Shaharning tarixiy qismidagi zamonaviy apartamentlar, jihozlangan oshxona va tezkor Wi-Fi bilan. Narx bir sutka uchun ko‘rsatilgan.', en: 'Stylish apartment in the historic district with an equipped kitchen and fast Wi-Fi. Price is per day.' },
  'Торговое помещение с высоким пешеходным трафиком, отдельным входом и подсобной комнатой. Подходит под магазин или аптеку.': { uz: 'Piyodalar oqimi yuqori bo‘lgan hududdagi alohida kirish va yordamchi xonali savdo joyi. Do‘kon yoki dorixona uchun mos.', en: 'Retail space in a high-footfall area with a separate entrance and storage room. Suitable for a shop or pharmacy.' },
  'Компактная студия с продуманным хранением и балконом. В стоимость включено обслуживание дома.': { uz: 'Saqlash joylari puxta o‘ylangan va balkonli ixcham studiya. Uy xizmatlari narxga kiritilgan.', en: 'Compact studio with smart storage and a balcony. Building maintenance is included in the price.' },
  'Сухое охраняемое место для автомобиля или хранения вещей. Аренда на длительный срок.': { uz: 'Avtomobil yoki buyumlarni saqlash uchun quruq, qo‘riqlanadigan joy. Uzoq muddatli ijara.', en: 'Dry, secure space for a vehicle or storage. Available for long-term rent.' },
  'Одноэтажный дом с просторным садом, летней верандой и мастерской. Тихая улица и дружелюбное соседство.': { uz: 'Keng bog‘i, yozgi ayvoni va ustaxonasi bor bir qavatli uy. Sokin ko‘cha va ahil qo‘shnilar.', en: 'Single-story home with a spacious garden, summer veranda, and workshop, on a quiet street with friendly neighbors.' },
  'Три комнаты, изолированная кухня и широкий балкон. Из окон открывается приятный вид на благоустроенную часть города.': { uz: 'Uch xona, alohida oshxona va keng balkon. Derazalardan shaharning obod qismi ko‘rinadi.', en: 'Three rooms, a separate kitchen, and a wide balcony, with pleasant views over a landscaped part of the city.' },
  'Атмосферное торговое пространство с высокими потолками в проходной туристической зоне. Возможны каникулы на время обустройства.': { uz: 'Sayyohlar ko‘p o‘tadigan hududdagi baland shiftli o‘ziga xos savdo joyi. Ta’mirlash davri uchun ijara imtiyozi muhokama qilinadi.', en: 'Distinctive retail space with high ceilings in a busy tourist area. A rent-free fit-out period may be available.' },
  'Участок в промышленной зоне с удобным доступом для грузового транспорта. Электричество и вода проходят рядом, назначение уточняется при просмотре.': { uz: 'Sanoat hududidagi yuk transporti uchun qulay kirishli yer uchastkasi. Elektr va suv tarmoqlari yaqin, foydalanish maqsadi ko‘rishda aniqlashtiriladi.', en: 'Industrial plot with convenient truck access. Electricity and water are nearby; permitted use should be confirmed during a viewing.' },
  'Участок 4.2 сотки': { uz: '4,2 sotix yer uchastkasi', en: '4.2-are plot' },
  '6 соток': { uz: '6 sotix', en: '6 ares' },
  'Городская прописка': { uz: 'Shahar ro‘yxatidan o‘tish', en: 'City residency registration' },
  'Смотровая яма': { uz: 'Ko‘rik chuquri', en: 'Inspection pit' },
  'Первая линия': { uz: 'Birinchi qator', en: 'Main-road frontage' },
  'Отдельный вход': { uz: 'Alohida kirish', en: 'Separate entrance' },
  'Витринные окна': { uz: 'Vitrina derazalari', en: 'Display windows' },
  'Электричество 3 фазы': { uz: '3 fazali elektr ta’minoti', en: 'Three-phase electricity' },
  'Мастер-спальня': { uz: 'Asosiy yotoqxona', en: 'Primary bedroom' },
  'Тёплый пол': { uz: 'Issiq pol', en: 'Underfloor heating' },
  '5 соток': { uz: '5 sotix', en: '5 ares' },
  '4.8 сотки': { uz: '4,8 sotix', en: '4.8 ares' },
  'Высота 5 м': { uz: 'Balandligi 5 m', en: '5 m ceiling height' },
  'Паркинг': { uz: 'Avtoturargoh', en: 'Parking' },
  'Заезд бесконтактный': { uz: 'Kontaktsiz kirish', en: 'Contactless access' },
  'Витрина': { uz: 'Vitrina', en: 'Storefront' },
  'Подсобная зона': { uz: 'Yordamchi xona', en: 'Utility area' },
  'Стиральная машина': { uz: 'Kir yuvish mashinasi', en: 'Washing machine' },
  '6.5 соток': { uz: '6,5 sotix', en: '6.5 ares' },
  'Хозблок': { uz: 'Xo‘jalik binosi', en: 'Storage outbuilding' },
  '12 соток': { uz: '12 sotix', en: '12 ares' },
  'Грузовой подъезд': { uz: 'Yuk transporti uchun kirish', en: 'Truck access' },
  'Ровная площадка': { uz: 'Tekis maydon', en: 'Level site' },
  'ул. Амира Темура, 62': { uz: 'Amir Temur ko‘chasi, 62', en: '62 Amir Temur Street' },
  'массив Буз-2, 18': { uz: 'Buz-2 mavzesi, 18', en: '18 Buz-2 residential area' },
  'ул. Мирзо Улугбека, 14': { uz: 'Mirzo Ulug‘bek ko‘chasi, 14', en: '14 Mirzo Ulugbek Street' },
  'ул. Фидокор, 9': { uz: 'Fidokor ko‘chasi, 9', en: '9 Fidokor Street' },
  'ул. Ибн Сино, 41': { uz: 'Ibn Sino ko‘chasi, 41', en: '41 Ibn Sino Street' },
  'ул. Истиклол, 27': { uz: 'Istiqlol ko‘chasi, 27', en: '27 Istiqlol Street' },
  'Чиланзар-8, гаражный массив 3': { uz: 'Chilonzor-8, 3-garaj mavzesi', en: 'Chilanzar-8, garage area 3' },
  'ул. Навои, 31': { uz: 'Navoiy ko‘chasi, 31', en: '31 Navoi Street' },
  'ул. Шота Руставели, 52': { uz: 'Shota Rustaveli ko‘chasi, 52', en: '52 Shota Rustaveli Street' },
  'ул. Чорбог, 7': { uz: 'Chorbog‘ ko‘chasi, 7', en: '7 Chorbog Street' },
  'ул. Ойбек, 24': { uz: 'Oybek ko‘chasi, 24', en: '24 Oybek Street' },
  'ул. Бобура, 120': { uz: 'Bobur ko‘chasi, 120', en: '120 Bobur Street' },
  'ул. Бахауддина Накшбанда, 82': { uz: 'Bahouddin Naqshband ko‘chasi, 82', en: '82 Bahauddin Naqshband Street' },
  'ул. Фаргона йули, 98': { uz: 'Farg‘ona yo‘li, 98', en: '98 Fergana Road' },
  'массив Сиёб, 6': { uz: 'Siyob mavzesi, 6', en: '6 Siyob residential area' },
  'просп. Амира Темура, 107': { uz: 'Amir Temur shohko‘chasi, 107', en: '107 Amir Temur Avenue' },
  'ул. Регистанская, 20': { uz: 'Registon ko‘chasi, 20', en: '20 Registan Street' },
  'ул. Навои, 14': { uz: 'Navoiy ko‘chasi, 14', en: '14 Navoi Street' },
  'ул. Мустакиллик, 35': { uz: 'Mustaqillik ko‘chasi, 35', en: '35 Mustaqillik Street' },
  'ул. Мирзо Улугбека, 77': { uz: 'Mirzo Ulug‘bek ko‘chasi, 77', en: '77 Mirzo Ulugbek Street' },
  'ул. Бердаха, 52': { uz: 'Berdaq ko‘chasi, 52', en: '52 Berdakh Street' },
  'ул. Бобура, 16': { uz: 'Bobur ko‘chasi, 16', en: '16 Bobur Street' },
  'ул. Бахауддина Накшбанда, 101': { uz: 'Bahouddin Naqshband ko‘chasi, 101', en: '101 Bahauddin Naqshband Street' },
  'Янгихаёт, промзона 2': { uz: 'Yangihayot, 2-sanoat hududi', en: 'Yangihayot, industrial zone 2' },
  'Фаррух Алиев': { uz: 'Farrux Aliyev', en: 'Farrukh Aliyev' },
  'Шерзод Турсунов': { uz: 'Sherzod Tursunov', en: 'Sherzod Tursunov' },
  'Малика Саидова': { uz: 'Malika Saidova', en: 'Malika Saidova' },
  'Азиза Бобоева': { uz: 'Aziza Boboyeva', en: 'Aziza Boboyeva' },
  'Агентство Makon Select': { uz: 'Makon Select agentligi', en: 'Makon Select agency' },
  'Агентство City Estate': { uz: 'City Estate agentligi', en: 'City Estate agency' },
  'Агентство Makon Living': { uz: 'Makon Living agentligi', en: 'Makon Living agency' },
  'Агентство Fergana Homes': { uz: 'Fergana Homes agentligi', en: 'Fergana Homes agency' },
  'Агентство Urban Space': { uz: 'Urban Space agentligi', en: 'Urban Space agency' },
  'Агентство Namangan Living': { uz: 'Namangan Living agentligi', en: 'Namangan Living agency' },
  'Агентство Samarkand House': { uz: 'Samarkand House agentligi', en: 'Samarkand House agency' },
  'Хозяин жилья': { uz: 'Uy egasi', en: 'Property owner' },
  'Сад': { uz: 'Bog‘', en: 'Garden' },
  'Центральная вода': { uz: 'Markaziy suv ta’minoti', en: 'Mains water' },
  'Офисы': { uz: 'Ofislar', en: 'Offices' },
  'Склады': { uz: 'Omborlar', en: 'Warehouses' },
  'без лишней суеты': { uz: 'ortiqcha tashvishsiz', en: 'without the hassle' },
  'Подбор с заботой': { uz: 'Sizga mos tanlov', en: 'Thoughtful recommendations' },
  'Проверенные объявления': { uz: 'Tekshirilgan e’lonlar', en: 'Verified listings' },
  'Средняя площадь в подборке': { uz: 'Tanlovdagi o‘rtacha maydon', en: 'Average area in this collection' },
  'для разных планов и бюджетов': { uz: 'turli rejalar va byudjetlar uchun', en: 'for different plans and budgets' },
  'Узнайте, сколько может стоить ваша недвижимость.': { uz: 'Ko‘chmas mulkingiz qancha turishini bilib oling.', en: 'Find out what your property could be worth.' },
  'Ориентир по стоимости на основе параметров объекта и демонстрационных данных рынка.': { uz: 'Obyekt xususiyatlari va demo bozor ma’lumotlari asosida taxminiy narx.', en: 'An indicative value based on property details and sample market data.' },
  'Подборка дня': { uz: 'Kunning tanlovi', en: 'PICKS OF THE DAY' },
  'Выбирайте привычный темп или откройте для себя новый город.': { uz: 'O‘zingizga mos sur’atni tanlang yoki yangi shaharni kashf eting.', en: 'Choose a familiar pace or discover a new city.' },
  'Удобные инструменты, чтобы принимать решения с большим спокойствием.': { uz: 'Xotirjam qaror qabul qilish uchun qulay vositalar.', en: 'Helpful tools for more confident decisions.' },
  'Современный частный дом в окружении зелени': { uz: 'Yashilliklar orasidagi zamonaviy xususiy uy', en: 'Modern private home surrounded by greenery' },
  'Фасад современного дома': { uz: 'Zamonaviy uy fasadi', en: 'Modern home exterior' },
  'Makon smart search · демо': { uz: 'Makon aqlli qidiruvi · demo', en: 'Makon smart search · demo' },
  'Демо анализирует только текст и поля. Маршруты до работы не рассчитываются.': { uz: 'Demo faqat matn va maydonlarni tahlil qiladi. Ishgacha bo‘lgan yo‘nalish hisoblanmaydi.', en: 'The demo analyzes text and form fields only; commute routes are not calculated.' },
  'Показываем демонстрационные варианты из каталога Makon.': { uz: 'Makon katalogidagi demo variantlarni ko‘rsatamiz.', en: 'Showing sample listings from the Makon catalog.' },
  'Пожелание по поездке сохранено. Расстояние и время в пути в демо не рассчитываются.': { uz: 'Yo‘l bo‘yicha istak saqlandi. Demo masofa va yo‘l vaqtini hisoblamaydi.', en: 'Your commute preference is saved; this demo does not calculate distance or travel time.' },
  'Найди квартиру в Ташкенте до $80 000': { uz: 'Toshkentdan $80 000 gacha kvartira top', en: 'Find an apartment in Tashkent under $80,000' },
  'Хочу арендовать дом рядом с центром': { uz: 'Markaz yaqinidan uy ijaraga olmoqchiman', en: 'I want to rent a house near the center' },
  'Найди гараж возле моего дома': { uz: 'Uyim yaqinidan garaj top', en: 'Find a garage near my home' },
  'Подбери помещение под магазин': { uz: 'Do‘kon uchun joy tanla', en: 'Find a space for a shop' },
  'Найди землю для строительства': { uz: 'Qurilish uchun yer top', en: 'Find land for construction' },
  'Напишите запрос или выберите пример ниже.': { uz: 'So‘rov yozing yoki quyidagi namunani tanlang.', en: 'Enter a search or choose an example below.' },
  'Гость Makon': { uz: 'Makon mehmoni', en: 'Makon guest' },
  'Оценки': { uz: 'Baholar', en: 'Valuations' },
  'Makon не использует регистрацию в этой версии. Все пользовательские данные остаются в localStorage браузера.': { uz: 'Bu versiyada Makon ro‘yxatdan o‘tishdan foydalanmaydi. Foydalanuvchi ma’lumotlari brauzer localStorage’ida qoladi.', en: 'This version of Makon does not use account registration. User data stays in browser local storage.' },
  'Сравнение объектов': { uz: 'Obyektlarni solishtirish', en: 'Compare properties' },
  'Цены и характеристики — демонстрационные данные.': { uz: 'Narxlar va xususiyatlar demo ma’lumotlardir.', en: 'Prices and details are sample data.' },
  'Рядом с вашим выбором': { uz: 'Siz tanlagan obyektlarga yaqin', en: 'NEAR YOUR PICKS' },
  'Демонстрационный контакт. Не отправляйте личные данные.': { uz: 'Demo kontakt. Shaxsiy ma’lumot yubormang.', en: 'Sample contact. Do not send personal information.' },
  'цена объявления': { uz: 'e’lon narxi', en: 'listing price' },
  'Ремонт': { uz: 'Ta’mir', en: 'Renovation' },
  'Выберите': { uz: 'Tanlang', en: 'Select' },
  'Без отделки': { uz: 'Ta’mirsiz', en: 'Unfinished' },
  'Оно сохранено в этом браузере как демонстрационный пример.': { uz: 'Ushbu brauzerda demo namuna sifatida saqlandi.', en: 'It was saved in this browser as a sample listing.' }
};

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function getSourceText(node: Text) {
  if (!originalText.has(node)) originalText.set(node, node.nodeValue || '');
  return originalText.get(node) || '';
}

function getSourceAttribute(element: Element, attribute: string) {
  let attributes = originalAttributes.get(element);
  if (!attributes) {
    attributes = new Map();
    originalAttributes.set(element, attributes);
  }
  if (!attributes.has(attribute)) attributes.set(attribute, element.getAttribute(attribute) || '');
  return attributes.get(attribute) || '';
}

function localizedText(source: string, locale: Locale) {
  if (locale === 'ru') return source;
  const trimmed = source.trim();
  const translation = dictionary[trimmed]?.[locale];
  if (translation) return source.replace(trimmed, translation);
  if (/^(?:ул\.|массив|просп\.|Чиланзар-8,|Янгихаёт,)/.test(trimmed)) {
    const addressPrefix = Object.keys(dictionary).find(key =>
      /^(?:ул\.|массив|просп\.|Чиланзар-8,|Янгихаёт,)/.test(key) && trimmed.startsWith(`${key}, `)
    );
    if (addressPrefix) {
      return `${dictionary[addressPrefix][locale]}${localizedText(trimmed.slice(addressPrefix.length), locale)}`;
    }
  }
  const listingCount = trimmed.match(/^(\d+) объявлени[еяй]$/);
  if (listingCount) return `${listingCount[1]} ${locale === 'en' ? (listingCount[1] === '1' ? 'listing' : 'listings') : 'ta e’lon'}`;
  const mapSummary = trimmed.match(/^Точные отметки: (\d+); примерные отметки \(центр города\): (\d+)\. Карта © OpenStreetMap\.$/);
  if (mapSummary) return locale === 'en'
    ? `Exact locations: ${mapSummary[1]}; approximate city-center locations: ${mapSummary[2]}. Map © OpenStreetMap.`
    : `Aniq joylar: ${mapSummary[1]}; shahar markazidagi taxminiy joylar: ${mapSummary[2]}. Xarita © OpenStreetMap.`;
  const catalogCount = trimmed.match(/^(\d+)\+? объекта? в каталоге$/);
  if (catalogCount) return `${catalogCount[1]}${trimmed.includes('+') ? '+' : ''} ${locale === 'en' ? 'listings' : 'ta obyekt'}${locale === 'en' ? '' : ' katalogda'}`;
  const cityCount = trimmed.match(/^(\d+) город(?:а|ов)$/);
  if (cityCount) return `${cityCount[1]} ${locale === 'en' ? (cityCount[1] === '1' ? 'city' : 'cities') : 'ta shahar'}`;
  const fromArea = trimmed.match(/^от (\d+) м²$/);
  if (fromArea) return locale === 'en' ? `from ${fromArea[1]} m²` : `${fromArea[1]} m² dan`;
  const published = trimmed.match(/^Опубликовано (.+)$/);
  if (published) {
    const dateParts = published[1].match(/^(\d{1,2}) ([а-яё]+) (\d{4}) г\.?$/i);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const monthIndex = dateParts ? months.indexOf(dateParts[2].toLocaleLowerCase('ru-RU')) : -1;
    const uzMonths = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const date = dateParts && monthIndex >= 0
      ? locale === 'en'
        ? new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(new Date(Date.UTC(Number(dateParts[3]), monthIndex, Number(dateParts[1]))))
        : `${dateParts[1]} ${uzMonths[monthIndex]} ${dateParts[3]}`
      : published[1];
    return source.replace(trimmed, `${locale === 'en' ? 'Published ' : 'Joylashtirilgan '}${date}`);
  }
  const floorValue = trimmed.match(/^(\d+) из (\d+)$/);
  if (floorValue) return locale === 'en' ? `${floorValue[1]} of ${floorValue[2]}` : `${floorValue[1]} / ${floorValue[2]}`;
  const comparisonCount = trimmed.match(/^(\d+) из 4 добавлено\.$/);
  if (comparisonCount) return locale === 'en'
    ? `${comparisonCount[1]} of 4 selected.`
    : `4 tadan ${comparisonCount[1]} tasi qo‘shildi.`;
  const pricePerArea = trimmed.match(/^(.+) за м²$/);
  if (pricePerArea) return `${pricePerArea[1]} ${locale === 'en' ? 'per' : 'har'} m²`;
  const phraseParts = trimmed.split(/( · |, | \/ )/);
  if (phraseParts.length > 1) {
    const translated = phraseParts.map(part => [' · ', ', ', ' / '].includes(part) ? part : localizedText(part, locale)).join('');
    if (translated !== trimmed) return source.replace(trimmed, translated);
  }
  const saved = trimmed.match(/^(\d+) объект(?:а|ов)? сохранён(?:о|ы|)? для вас\.$/);
  if (saved) return `${saved[1]} ${locale === 'en' ? 'saved listing(s) for you.' : 'ta e’lon siz uchun saqlandi.'}`;
  const results = trimmed.match(/^(\d+) объект(?:а|ов)?$/);
  if (results) return `${results[1]} ${locale === 'en' ? (results[1] === '1' ? 'property' : 'properties') : 'ta obyekt'}`;
  const abbreviatedRooms = trimmed.match(/^(\d+) комн\.$/);
  if (abbreviatedRooms) return `${abbreviatedRooms[1]} ${locale === 'en' ? (abbreviatedRooms[1] === '1' ? 'room' : 'rooms') : 'xona'}`;
  const rooms = trimmed.match(/^(\d+) комнат(?:а|ы)?$/);
  if (rooms) return `${rooms[1]} ${locale === 'en' ? (rooms[1] === '1' ? 'room' : 'rooms') : 'xona'}`;
  const floor = trimmed.match(/^(\d+)(?: из (\d+))? этаж$/);
  if (floor) return locale === 'en'
    ? `Floor ${floor[1]}${floor[2] ? ` of ${floor[2]}` : ''}`
    : `${floor[1]}-qavat${floor[2] ? `, jami ${floor[2]} qavat` : ''}`;
  const area = trimmed.match(/^(\d+(?:[.,]\d+)?) м²(?: общей площади)?$/);
  if (area) return `${area[1]} m²${trimmed.endsWith('общей площади') ? (locale === 'en' ? ' total area' : ' umumiy maydon') : ''}`;
  const openedListing = trimmed.match(/^Открыть: (.+)$/);
  if (openedListing) return `${locale === 'en' ? 'Open: ' : 'Ochish: '}${dictionary[openedListing[1]]?.[locale] || openedListing[1]}`;
  const photoAlt = trimmed.match(/^(.+) — фото (\d+)$/);
  if (photoAlt) return `${dictionary[photoAlt[1]]?.[locale] || photoAlt[1]} — ${locale === 'en' ? 'photo' : 'surat'} ${photoAlt[2]}`;
  const photoButton = trimmed.match(/^Посмотреть фотографию (\d+)$/);
  if (photoButton) return `${locale === 'en' ? 'View photo' : 'Suratni ko‘rish'} ${photoButton[1]}`;
  const range = trimmed.match(/^Диапазон: (.+)$/);
  if (range) return `${locale === 'en' ? 'Range: ' : 'Oraliq: '}${range[1]}`;
  const valuationExplanation = trimmed.match(/^Расчёт использовал (\d+) демонстрационных объектов категории «(.+)»( в городе (.+)|, в разных городах) и поправку на состояние\. Ваши параметры и адрес могут заметно изменить цену\.$/);
  if (valuationExplanation) {
    const count = valuationExplanation[1];
    const category = dictionary[valuationExplanation[2]]?.[locale] || valuationExplanation[2];
    const city = valuationExplanation[4] ? dictionary[valuationExplanation[4]]?.[locale] || valuationExplanation[4] : '';
    return locale === 'en'
      ? `The estimate used ${count} sample ${count === '1' ? 'property' : 'properties'}${category ? ` of type ${category}` : ''}${city ? ` in ${city}` : ' from different cities'} and adjusted for condition. Your details and address can change the price substantially.`
      : `Hisob-kitob${city ? ` ${city} shahridagi` : ' turli shaharlardagi'} ${category} turidagi ${count} ta demo obyekt va holat bo‘yicha tuzatishdan foydalandi. Ma’lumotlaringiz va manzil narxni sezilarli o‘zgartirishi mumkin.`;
  }
  const aiResult = trimmed.match(/^Нашёл (\d+) вариант(?:а|ов)?(?: по параметрам: (.+))?\. Совпадения основаны на типе, городе, бюджете и районе из объявления\.$/);
  if (aiResult) {
    const details = aiResult[2]?.split(', ').map(value => {
      if (value.startsWith('до ')) return `${locale === 'en' ? 'up to ' : ''}${value.slice(3)}${locale === 'en' ? '' : ' gacha'}`;
      const key = value.charAt(0).toUpperCase() + value.slice(1);
      return dictionary[key]?.[locale] || value;
    }).join(', ');
    return locale === 'en'
      ? `Found ${aiResult[1]} ${aiResult[1] === '1' ? 'match' : 'matches'}${details ? ` for ${details}` : ''}. Results are based on each listing’s type, city, budget, and district.`
      : `${aiResult[1]} ta mos variant${details ? ` (${details})` : ''} topildi. Natijalar e’lon turi, shahri, byudjeti va tumaniga asoslangan.`;
  }
  const aiNoResult = trimmed.match(/^Точных совпадений в каталоге пока нет(?: \((.+)\))?\. Попробуйте расширить бюджет или убрать одно условие\.$/);
  if (aiNoResult) return locale === 'en'
    ? `No exact matches found${aiNoResult[1] ? ` (${aiNoResult[1]})` : ''}. Try increasing your budget or removing a filter.`
    : `Katalogda aniq mos variantlar topilmadi${aiNoResult[1] ? ` (${aiNoResult[1]})` : ''}. Byudjetni oshiring yoki bir mezonni olib tashlang.`;
  const numberedLabel = trimmed.match(/^(\d+)\. (.+)$/);
  if (numberedLabel && dictionary[numberedLabel[2]]?.[locale]) {
    return `${numberedLabel[1]}. ${dictionary[numberedLabel[2]][locale]}`;
  }
  const step = trimmed.match(/^Шаг (\d+) из (\d+)$/);
  if (step) return locale === 'en' ? `Step ${step[1]} of ${step[2]}` : `${step[step.length - 1]} qadamdan ${step[1]}-qadam`;
  if (trimmed.includes(' / мес.')) return source.replace(' / мес.', locale === 'en' ? ' / month' : ' / oyiga');
  if (trimmed.includes(' / сутки')) return source.replace(' / сутки', locale === 'en' ? ' / day' : ' / kuniga');
  if (trimmed === 'Начать подбор') return locale === 'en' ? 'Start search' : 'Qidirishni boshlash';
  return source.replaceAll('м²', 'm²');
}

function translateSubtree(root: Node, locale: Locale) {
  const elementRoot = root instanceof Element ? root : root.parentElement;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = root.nodeType === Node.TEXT_NODE ? [root as Text] : [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach(node => {
    const parent = node.parentElement;
    if (!parent || parent.closest('script,style,textarea,code,pre')) return;
    node.nodeValue = localizedText(getSourceText(node), locale);
  });
  if (!elementRoot) return;
  const elements = [elementRoot, ...elementRoot.querySelectorAll('*')];
  elements.forEach(element => {
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(attribute => {
      if (element.hasAttribute(attribute)) {
        element.setAttribute(attribute, localizedText(getSourceAttribute(element, attribute), locale));
      }
    });
  });
}

export function getLocale(): Locale {
  const saved = readStore<string>('locale', 'ru');
  return saved === 'uz' || saved === 'en' ? saved : 'ru';
}

export function setLocale(locale: Locale) {
  writeStore('locale', locale);
  document.documentElement.lang = locale === 'uz' ? 'uz-Latn' : locale;
  const pageTitles: Record<string, Record<Locale, string>> = {
    home: { ru: 'Makon — недвижимость по-новому', uz: 'Makon — ko‘chmas mulk yangicha', en: 'Makon — real estate, reimagined' },
    catalog: { ru: 'Каталог недвижимости — Makon', uz: 'Ko‘chmas mulk katalogi — Makon', en: 'Property listings — Makon' },
    property: { ru: 'Объявление — Makon', uz: 'E’lon — Makon', en: 'Property listing — Makon' },
    favorites: { ru: 'Избранное — Makon', uz: 'Saralanganlar — Makon', en: 'Favorites — Makon' },
    compare: { ru: 'Сравнение объектов — Makon', uz: 'Obyektlarni solishtirish — Makon', en: 'Compare properties — Makon' },
    'ai-search': { ru: 'Умный подбор — Makon', uz: 'Aqlli tanlov — Makon', en: 'Smart search — Makon' },
    profile: { ru: 'Личный кабинет — Makon', uz: 'Shaxsiy kabinet — Makon', en: 'My account — Makon' },
    'create-listing': { ru: 'Разместить объявление — Makon', uz: 'E’lon joylashtirish — Makon', en: 'Post a listing — Makon' },
    valuation: { ru: 'Оценка недвижимости — Makon', uz: 'Ko‘chmas mulk bahosi — Makon', en: 'Property valuation — Makon' },
    login: { ru: 'Войти — Makon', uz: 'Kirish — Makon', en: 'Sign in — Makon' }
  };
  const title = pageTitles[document.body.dataset.page || 'home'];
  if (title) document.title = title[locale];
  translateSubtree(document.body, locale);
}

export function installTranslations() {
  const locale = getLocale();
  const pageTitles: Record<string, Record<Locale, string>> = {
    home: { ru: 'Makon — недвижимость по-новому', uz: 'Makon — ko‘chmas mulk yangicha', en: 'Makon — real estate, reimagined' },
    catalog: { ru: 'Каталог недвижимости — Makon', uz: 'Ko‘chmas mulk katalogi — Makon', en: 'Property listings — Makon' },
    property: { ru: 'Объявление — Makon', uz: 'E’lon — Makon', en: 'Property listing — Makon' },
    favorites: { ru: 'Избранное — Makon', uz: 'Saralanganlar — Makon', en: 'Favorites — Makon' },
    compare: { ru: 'Сравнение объектов — Makon', uz: 'Obyektlarni solishtirish — Makon', en: 'Compare properties — Makon' },
    'ai-search': { ru: 'Умный подбор — Makon', uz: 'Aqlli tanlov — Makon', en: 'Smart search — Makon' },
    profile: { ru: 'Личный кабинет — Makon', uz: 'Shaxsiy kabinet — Makon', en: 'My account — Makon' },
    'create-listing': { ru: 'Разместить объявление — Makon', uz: 'E’lon joylashtirish — Makon', en: 'Post a listing — Makon' },
    valuation: { ru: 'Оценка недвижимости — Makon', uz: 'Ko‘chmas mulk bahosi — Makon', en: 'Property valuation — Makon' },
    login: { ru: 'Войти — Makon', uz: 'Kirish — Makon', en: 'Sign in — Makon' }
  };
  const title = pageTitles[document.body.dataset.page || 'home'];
  if (title) document.title = title[locale];
  document.documentElement.lang = locale === 'uz' ? 'uz-Latn' : locale;
  translateSubtree(document.body, locale);
  const observer = new MutationObserver(records => {
    const locale = getLocale();
    records.forEach(record => record.addedNodes.forEach(node => translateSubtree(node, locale)));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
