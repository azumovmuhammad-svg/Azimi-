// Category data with subcategories and fields
const categoryData = {
  realestate: {
    name: "Недвижимость",
    icon: "🏠",
    subcategories: {
      apartments_sale: {
        name: "Квартиры (продажа)",
        fields: [
          { name: "rooms", label: "Комнат", type: "select", options: ["Студия", "1", "2", "3", "4", "5+"] },
          { name: "area", label: "Площадь (м²)", type: "number", placeholder: "Общая площадь" },
          { name: "floor", label: "Этаж", type: "text", placeholder: "Например: 5 из 9" },
          { name: "building_type", label: "Тип дома", type: "select", options: ["Панельный", "Кирпичный", "Монолитный", "Блочный"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Евроремонт", "Хороший ремонт", "Среднее", "Требует ремонта", "Черновая отделка"] },
          { name: "heating", label: "Отопление", type: "select", options: ["Центральное", "Автономное", "Электро", "Отсутствует"] }
        ]
      },
      apartments_rent: {
        name: "Квартиры (аренда)",
        fields: [
          { name: "rooms", label: "Комнат", type: "select", options: ["Студия", "1", "2", "3", "4", "5+"] },
          { name: "area", label: "Площадь (м²)", type: "number", placeholder: "Общая площадь" },
          { name: "floor", label: "Этаж", type: "text", placeholder: "Например: 5 из 9" },
          { name: "rent_period", label: "Срок аренды", type: "select", options: ["Посуточно", "Помесячно", "На длительный срок"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Евроремонт", "Хороший ремонт", "Среднее", "Требует ремонта"] },
          { name: "furniture", label: "Мебель", type: "select", options: ["Полностью меблирована", "Частично", "Без мебели"] }
        ]
      },
      houses_sale: {
        name: "Дома (продажа)",
        fields: [
          { name: "rooms", label: "Комнат", type: "select", options: ["1", "2", "3", "4", "5", "6+"] },
          { name: "house_area", label: "Площадь дома (м²)", type: "number" },
          { name: "land_area", label: "Площадь участка (соток)", type: "number" },
          { name: "floors", label: "Этажность", type: "select", options: ["1", "2", "3", "4+"] },
          { name: "material", label: "Материал", type: "select", options: ["Кирпич", "Блок", "Дерево", "Саман", "Монолит"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Среднее", "Требует ремонта"] }
        ]
      },
      houses_rent: {
        name: "Дома (аренда)",
        fields: [
          { name: "rooms", label: "Комнат", type: "select", options: ["1", "2", "3", "4", "5", "6+"] },
          { name: "house_area", label: "Площадь дома (м²)", type: "number" },
          { name: "land_area", label: "Площадь участка (соток)", type: "number" },
          { name: "rent_period", label: "Срок аренды", type: "select", options: ["Посуточно", "Помесячно", "На длительный срок"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Среднее"] }
        ]
      },
      land: {
        name: "Участки",
        fields: [
          { name: "area", label: "Площадь (соток)", type: "number" },
          { name: "purpose", label: "Назначение", type: "select", options: ["ИЖС", "Садоводство", "Фермерство", "Коммерция", "Другое"] },
          { name: "communications", label: "Коммуникации", type: "select", options: ["Все есть", "Частично", "Нет"] }
        ]
      },
      commercial: {
        name: "Коммерческая",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Офис", "Магазин", "Склад", "Кафе/Ресторан", "Производство", "Другое"] },
          { name: "area", label: "Площадь (м²)", type: "number" },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Требует ремонта"] }
        ]
      }
    }
  },
  cars: {
    name: "Авто",
    icon: "🚗",
    subcategories: {
      cars_sale: {
        name: "Легковые (продажа)",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Lexus", "Hyundai", "Kia", "Lada", "Другая"] },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: Camry" },
          { name: "year", label: "Год выпуска", type: "select", options: Array.from({length: 30}, (_, i) => (2025 - i).toString()) },
          { name: "body_type", label: "Кузов", type: "select", options: ["Седан", "Хэтчбек", "Универсал", "Кроссовер", "Внедорожник", "Купе", "Минивэн"] },
          { name: "engine", label: "Двигатель", type: "select", options: ["Бензин", "Дизель", "Гибрид", "Электро"] },
          { name: "transmission", label: "Коробка", type: "select", options: ["Механика", "Автомат", "Вариатор", "Робот"] },
          { name: "drive", label: "Привод", type: "select", options: ["Передний", "Задний", "Полный"] },
          { name: "mileage", label: "Пробег (км)", type: "number", placeholder: "Например: 50000" },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Удовлетворительное", "Требует ремонта"] }
        ]
      },
      cars_rent: {
        name: "Авто (аренда)",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Toyota", "Honda", "BMW", "Mercedes", "Audi", "Lexus", "Hyundai", "Kia", "Другая"] },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: Camry" },
          { name: "year", label: "Год", type: "select", options: Array.from({length: 15}, (_, i) => (2025 - i).toString()) },
          { name: "rent_period", label: "Срок аренды", type: "select", options: ["Посуточно", "Помесячно", "На длительный срок"] },
          { name: "transmission", label: "Коробка", type: "select", options: ["Механика", "Автомат"] },
          { name: "with_driver", label: "С водителем", type: "select", options: ["Да", "Нет"] }
        ]
      },
      trucks: {
        name: "Грузовые",
        fields: [
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: KamAZ" },
          { name: "year", label: "Год", type: "select", options: Array.from({length: 30}, (_, i) => (2025 - i).toString()) },
          { name: "capacity", label: "Грузоподъемность", type: "text", placeholder: "Например: 10 тонн" },
          { name: "condition", label: "Состояние", type: "select", options: ["Отличное", "Хорошее", "Удовлетворительное"] }
        ]
      },
      motorcycles: {
        name: "Мотоциклы",
        fields: [
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: Yamaha" },
          { name: "model", label: "Модель", type: "text" },
          { name: "year", label: "Год", type: "select", options: Array.from({length: 20}, (_, i) => (2025 - i).toString()) },
          { name: "engine_volume", label: "Объем двигателя (см³)", type: "number" }
        ]
      },
      parts: {
        name: "Запчасти",
        fields: [
          { name: "category", label: "Категория", type: "select", options: ["Двигатель", "Кузов", "Подвеска", "Электрика", "Салон", "Другое"] },
          { name: "brand", label: "Марка авто", type: "text", placeholder: "Например: Toyota" },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: Camry 50" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      }
    }
  },
  electronics: {
    name: "Электроника",
    icon: "📱",
    subcategories: {
      phones: {
        name: "Телефоны",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Apple", "Samsung", "Xiaomi", "Huawei", "Honor", "Realme", "Nokia", "Другой"] },
          { name: "model", label: "Модель", type: "text", placeholder: "Например: iPhone 13 Pro" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Удовлетворительное"] },
          { name: "memory", label: "Память", type: "select", options: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
          { name: "color", label: "Цвет", type: "text", placeholder: "Например: Синий" }
        ]
      },
      laptops: {
        name: "Ноутбуки",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Другой"] },
          { name: "screen_size", label: "Диагональ", type: "select", options: ["13\"", "14\"", "15.6\"", "16\"", "17\""] },
          { name: "ram", label: "ОЗУ", type: "select", options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
          { name: "storage", label: "Накопитель", type: "select", options: ["SSD 128 GB", "SSD 256 GB", "SSD 512 GB", "SSD 1 TB", "HDD"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Удовлетворительное"] }
        ]
      },
      tablets: {
        name: "Планшеты",
        fields: [
          { name: "brand", label: "Марка", type: "select", options: ["Apple iPad", "Samsung", "Xiaomi", "Huawei", "Lenovo", "Другой"] },
          { name: "model", label: "Модель", type: "text" },
          { name: "screen_size", label: "Диагональ", type: "select", options: ["7\"", "8\"", "9\"", "10\"", "11\"", "12\"", "13\""] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Удовлетворительное"] }
        ]
      },
      audio: {
        name: "Аудио",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Наушники", "Колонки", "Микрофон", "Усилитель", "Плеер"] },
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: Sony" },
          { name: "connection", label: "Подключение", type: "select", options: ["Проводные", "Bluetooth", "Беспроводные"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее"] }
        ]
      },
      photo: {
        name: "Фото/Видео",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Фотоаппарат", "Видеокамера", "Объектив", "Аксессуар"] },
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: Canon" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее"] }
        ]
      },
      games: {
        name: "Игры и приставки",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Приставка", "Игра", "Аксессуар"] },
          { name: "platform", label: "Платформа", type: "select", options: ["PlayStation", "Xbox", "Nintendo", "PC", "Другая"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      }
    }
  },
  accessories: {
    name: "Аксессуары",
    icon: "⌚",
    subcategories: {
      watches: {
        name: "Часы",
        fields: [
          { name: "brand", label: "Марка", type: "text", placeholder: "Например: Casio" },
          { name: "type", label: "Тип", type: "select", options: ["Механические", "Кварцевые", "Электронные", "Смарт-часы"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новые", "Отличное", "Хорошее"] }
        ]
      },
      bags: {
        name: "Сумки и рюкзаки",
        fields: [
          { name: "brand", label: "Марка", type: "text" },
          { name: "type", label: "Тип", type: "select", options: ["Сумка", "Рюкзак", "Кошелек", "Чемодан"] },
          { name: "material", label: "Материал", type: "select", options: ["Кожа", "Ткань", "Замша", "Другой"] }
        ]
      },
      jewelry: {
        name: "Украшения",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Кольцо", "Серьги", "Цепочка", "Браслет", "Подвеска"] },
          { name: "metal", label: "Металл", type: "select", options: ["Золото", "Серебро", "Платина", "Другой"] },
          { name: "gemstone", label: "Камень", type: "text", placeholder: "Например: Бриллиант" }
        ]
      },
      glasses: {
        name: "Очки",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Солнцезащитные", "Для зрения", "Аксессуар"] },
          { name: "brand", label: "Марка", type: "text" }
        ]
      },
      other: {
        name: "Другие аксессуары",
        fields: [
          { name: "type", label: "Тип", type: "text", placeholder: "Например: Ремень" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      }
    }
  },
  services: {
    name: "Услуги",
    icon: "🔧",
    subcategories: {
      repair: {
        name: "Ремонт и обслуживание",
        fields: [
          { name: "type", label: "Тип услуги", type: "select", options: ["Ремонт техники", "Ремонт авто", "Ремонт обуви", "Ремонт одежды", "Другое"] },
          { name: "experience", label: "Опыт работы", type: "select", options: ["Менее года", "1-3 года", "3-5 лет", "Более 5 лет"] },
          { name: "warranty", label: "Гарантия", type: "select", options: ["Есть", "Нет"] }
        ]
      },
      beauty: {
        name: "Красота и здоровье",
        fields: [
          { name: "type", label: "Тип услуги", type: "select", options: ["Парикмахер", "Маникюр", "Косметолог", "Массаж", "Визажист"] },
          { name: "specialist", label: "Специалист", type: "select", options: ["Женщина", "Мужчина", "Любой"] }
        ]
      },
      education: {
        name: "Обучение",
        fields: [
          { name: "subject", label: "Предмет", type: "text", placeholder: "Например: Английский язык" },
          { name: "level", label: "Уровень", type: "select", options: ["Школьники", "Студенты", "Взрослые"] }
        ]
      },
      cleaning: {
        name: "Уборка",
        fields: [
          { name: "type", label: "Тип уборки", type: "select", options: ["Квартира", "Дом", "Офис", "После ремонта"] },
          { name: "area", label: "Площадь (м²)", type: "number" }
        ]
      },
      transport: {
        name: "Грузоперевозки",
        fields: [
          { name: "vehicle", label: "Тип авто", type: "select", options: ["Газель", "Грузовик", "Микроавтобус"] },
          { name: "capacity", label: "Грузоподъемность", type: "text" }
        ]
      }
    }
  },
  home_garden: {
    name: "Для дома",
    icon: "🏡",
    subcategories: {
      furniture: {
        name: "Мебель",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Диван", "Кровать", "Стол", "Стул", "Шкаф", "Кухня", "Другое"] },
          { name: "material", label: "Материал", type: "select", options: ["Дерево", "Металл", "Пластик", "Ткань", "Кожа"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Б/у"] }
        ]
      },
      appliances: {
        name: "Бытовая техника",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Холодильник", "Стиральная машина", "Плита", "Микроволновка", "Пылесос", "Другое"] },
          { name: "brand", label: "Марка", type: "text" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее", "Требует ремонта"] }
        ]
      },
      dishes: {
        name: "Посуда",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Кастрюли", "Сковороды", "Тарелки", "Чашки", "Наборы"] },
          { name: "material", label: "Материал", type: "select", options: ["Стекло", "Керамика", "Металл", "Пластик"] }
        ]
      },
      decor: {
        name: "Декор",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Картина", "Ваза", "Свечи", "Подушки", "Ковер"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      },
      garden: {
        name: "Сад и огород",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Инструменты", "Семена", "Удобрения", "Полив"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      }
    }
  },
  work: {
    name: "Работа",
    icon: "💼",
    subcategories: {
      vacancies: {
        name: "Вакансии",
        fields: [
          { name: "profession", label: "Профессия", type: "text", placeholder: "Например: Продавец" },
          { name: "experience", label: "Опыт", type: "select", options: ["Без опыта", "1-3 года", "3-5 лет", "Более 5 лет"] },
          { name: "employment", label: "Занятость", type: "select", options: ["Полная", "Частичная", "Удаленная", "Стажировка"] },
          { name: "salary", label: "Зарплата", type: "text", placeholder: "Например: от 5000 TJS" }
        ]
      },
      resumes: {
        name: "Резюме",
        fields: [
          { name: "profession", label: "Профессия", type: "text" },
          { name: "experience", label: "Опыт", type: "select", options: ["Без опыта", "1-3 года", "3-5 лет", "Более 5 лет"] },
          { name: "education", label: "Образование", type: "select", options: ["Среднее", "Средне-специальное", "Высшее"] }
        ]
      }
    }
  },
  business: {
    name: "Бизнес",
    icon: "📊",
    subcategories: {
      equipment: {
        name: "Оборудование",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Торговое", "Промышленное", "Офисное", "Пищевое"] },
          { name: "brand", label: "Марка", type: "text" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      },
      furniture_office: {
        name: "Офисная мебель",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Столы", "Стулья", "Шкафы", "Кресла"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      },
      franchises: {
        name: "Франшизы",
        fields: [
          { name: "sphere", label: "Сфера", type: "text" },
          { name: "investment", label: "Инвестиции", type: "text", placeholder: "Например: от 10000 $" }
        ]
      },
      business_sale: {
        name: "Продажа бизнеса",
        fields: [
          { name: "type", label: "Тип бизнеса", type: "text" },
          { name: "revenue", label: "Ежемесячная выручка", type: "text" },
          { name: "reason", label: "Причина продажи", type: "text" }
        ]
      }
    }
  },
  clothes: {
    name: "Одежда",
    icon: "👕",
    subcategories: {
      women: {
        name: "Женская",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Платья", "Блузы", "Юбки", "Брюки", "Джинсы", "Куртки", "Пальто"] },
          { name: "size", label: "Размер", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее"] }
        ]
      },
      men: {
        name: "Мужская",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Рубашки", "Футболки", "Джинсы", "Брюки", "Куртки", "Костюмы"] },
          { name: "size", label: "Размер", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее"] }
        ]
      },
      children: {
        name: "Детская",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Для девочек", "Для мальчиков", "Для малышей"] },
          { name: "age", label: "Возраст", type: "text", placeholder: "Например: 2-3 года" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее"] }
        ]
      },
      shoes: {
        name: "Обувь",
        fields: [
          { name: "gender", label: "Для кого", type: "select", options: ["Женская", "Мужская", "Детская"] },
          { name: "type", label: "Тип", type: "select", options: ["Кроссовки", "Туфли", "Сапоги", "Ботинки", "Сандалии"] },
          { name: "size", label: "Размер", type: "number", placeholder: "Например: 39" },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Отличное", "Хорошее"] }
        ]
      },
      accessories_clothes: {
        name: "Аксессуары",
        fields: [
          { name: "type", label: "Тип", type: "select", options: ["Ремни", "Шапки", "Шарфы", "Перчатки", "Галстуки"] },
          { name: "condition", label: "Состояние", type: "select", options: ["Новое", "Б/у"] }
        ]
      }
    }
  }  // ← БЕ ВЕРГУЛ!
};

let selectedCategory = null;
let selectedSubcategory = null;
let postId = null;

document.addEventListener("DOMContentLoaded", () => {
  postId = document.querySelector(".app").dataset.postId;

  // Character counters
  document.getElementById("titleInput").addEventListener("input", function() {
    document.getElementById("titleCounter").textContent = this.value.length;
    validateForm();
  });

  document.getElementById("descriptionInput").addEventListener("input", function() {
    document.getElementById("descCounter").textContent = this.value.length;
    validateForm();
  });

  // Price negotiable toggle
  document.getElementById("negotiableCheckbox").addEventListener("change", function() {
    document.getElementById("priceInput").disabled = this.checked;
    if (this.checked) document.getElementById("priceInput").value = "";
  });

  // Continue button
  document.getElementById("continueBtn").addEventListener("click", submitForm);
});

function openCategoryModal() {
  const modal = document.getElementById("categoryModal");
  const list = document.getElementById("categoryList");

  list.innerHTML = Object.entries(categoryData).map(([key, cat]) => `
    <div class="category-item" onclick="selectCategory('${key}')">
      <div class="icon">${cat.icon}</div>
      <div class="info">
        <div class="name">${cat.name}</div>
        <div class="count">${Object.keys(cat.subcategories).length} подкатегорий</div>
      </div>
      <span class="material-icons-outlined">chevron_right</span>
    </div>
  `).join("");

  modal.classList.add("active");
}

function selectCategory(catKey) {
  selectedCategory = catKey;
  const cat = categoryData[catKey];

  document.getElementById("categoryBtn").classList.add("selected");
  document.getElementById("categoryBtn").querySelector(".selector-text").textContent = cat.name;

  closeModals();

  // Show subcategory section
  document.getElementById("subcategorySection").style.display = "block";
  document.getElementById("subcategoryBtn").querySelector(".selector-text").textContent = "Выберите подкатегорию";
  document.getElementById("dynamicFields").innerHTML = "";
  selectedSubcategory = null;
  document.getElementById("subcategoryBtn").classList.remove("selected");
}

function openSubcategoryModal() {
  if (!selectedCategory) return;

  const modal = document.getElementById("subcategoryModal");
  const list = document.getElementById("subcategoryList");
  const cat = categoryData[selectedCategory];

  document.getElementById("subcategoryTitle").textContent = cat.name;

  list.innerHTML = Object.entries(cat.subcategories).map(([key, sub]) => `
    <div class="category-item" onclick="selectSubcategory('${key}')">
      <div class="info" style="margin-left: 0;">
        <div class="name">${sub.name}</div>
        <div class="count">${sub.fields.length} параметров</div>
      </div>
      <span class="material-icons-outlined">chevron_right</span>
    </div>
  `).join("");

  modal.classList.add("active");
}

function selectSubcategory(subKey) {
  selectedSubcategory = subKey;
  const cat = categoryData[selectedCategory];
  const sub = cat.subcategories[subKey];

  document.getElementById("subcategoryBtn").classList.add("selected");
  document.getElementById("subcategoryBtn").querySelector(".selector-text").textContent = sub.name;

  closeModals();

  // Render dynamic fields
  renderDynamicFields(sub.fields);
}

function renderDynamicFields(fields) {
  const container = document.getElementById("dynamicFields");

  container.innerHTML = fields.map(field => {
    if (field.type === "select") {
      return `
        <div class="dynamic-field">
          <label class="field-label">${field.label}</label>
          <select class="select-input dynamic-data" name="${field.name}" required>
            <option value="">Выберите...</option>
            ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
          </select>
        </div>
      `;
    } else {
      return `
        <div class="dynamic-field">
          <label class="field-label">${field.label}</label>
          <input type="${field.type}" class="text-input dynamic-data" name="${field.name}" 
                 placeholder="${field.placeholder || ''}" required>
        </div>
      `;
    }
  }).join("");

  // Add validation listeners
  container.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("change", validateForm);
    el.addEventListener("input", validateForm);
  });

  validateForm();
}

function validateForm() {
  const title = document.getElementById("titleInput").value.trim();
  const description = document.getElementById("descriptionInput").value.trim();
  const hasCategory = selectedCategory && selectedSubcategory;

  // Check dynamic fields
  const dynamicFields = document.querySelectorAll(".dynamic-data");
  let dynamicValid = true;
  dynamicFields.forEach(field => {
    if (field.required && !field.value) dynamicValid = false;
  });

  const isValid = title && description && hasCategory && dynamicValid;
  document.getElementById("continueBtn").disabled = !isValid;
}

async function submitForm() {
  const btn = document.getElementById("continueBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Сохранение...';

  // Collect dynamic data
  const dynamicData = {};
  document.querySelectorAll(".dynamic-data").forEach(field => {
    dynamicData[field.name] = field.value;
  });

  // Save to PostData if available
  if (typeof PostData !== 'undefined') {
    PostData.title = document.getElementById("titleInput").value.trim();
    PostData.category = selectedCategory;
    PostData.subcategory = selectedSubcategory;
    PostData.price = document.getElementById("priceInput").value;
    PostData.currency = document.getElementById("currencySelect").value;
    PostData.negotiable = document.getElementById("negotiableCheckbox").checked;
    PostData.description = document.getElementById("descriptionInput").value.trim();
    PostData.attributes = dynamicData;
    PostData.save();
  }

  const formData = new FormData();
  formData.append("post_id", postId);
  formData.append("title", document.getElementById("titleInput").value.trim());
  formData.append("category", selectedCategory);
  formData.append("subcategory", selectedSubcategory);
  formData.append("price", document.getElementById("priceInput").value || "");
  formData.append("currency", document.getElementById("currencySelect").value);
  formData.append("negotiable", document.getElementById("negotiableCheckbox").checked ? "true" : "false");
  formData.append("description", document.getElementById("descriptionInput").value.trim());
  formData.append("attributes", JSON.stringify(dynamicData));

  try {
    const res = await fetch("/auth/post/add-details", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!res.ok) throw new Error("Save failed");

    window.location.href = `/auth/add3?post_id=${postId}`;

  } catch (err) {
    console.error(err);
    alert("Ошибка сохранения");
    btn.disabled = false;
    btn.innerHTML = 'Продолжить <span class="material-icons-outlined">arrow_forward</span>';
  }
}

function closeModals() {
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
}

function exitPost() {
  if (confirm("Выйти без сохранения?")) {
    window.location.href = "/feed";
  }
}

