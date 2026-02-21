from PIL import Image, ImageDraw

# Размери тасвир
width, height = 400, 300

# Создание тёмного фона
img = Image.new('RGB', (width, height), color='#0d1b38')
draw = ImageDraw.Draw(img)

# Рамка
draw.rectangle([10, 10, width-10, height-10], outline='#1e88e5', width=3)

# Дайра дар марказ
center_x, center_y = width // 2, height // 2 - 20
radius = 50
draw.ellipse([center_x - radius, center_y - radius, 
              center_x + radius, center_y + radius], 
             fill='#1e88e5', outline='#0d47a1', width=3)

# Текст "Нет фото"
draw.text((center_x - 60, center_y + radius + 20), 
          "Нет фото", fill='#ffffff')

# Текст хурдтар
draw.text((center_x - 80, center_y + radius + 50), 
          "Изображение отсутствует", fill='#90a4ae')

# Сохранение
img.save('static/no-image.png')
print("✅ static/no-image.png сохранён!")

