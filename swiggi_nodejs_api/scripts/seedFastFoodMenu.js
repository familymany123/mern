const mongoose = require("mongoose");
const Food = require("../app/models/food.model");
const Category = require("../app/models/category.model");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/swiggi";

const categoryDefinitions = [
  { name: "Gà Rán", slug: "ga-ran", aliases: ["gà rán", "ga ran"] },
  { name: "Burger", slug: "burger", aliases: ["burger"] },
  { name: "Mì Ý", slug: "mi-y", aliases: ["mì ý", "mi y"] },
  { name: "Combo Ăn Nhanh", slug: "combo-an-nhanh", aliases: ["combo ăn nhanh", "combo an nhanh", "combo"] },
  { name: "Món Phụ", slug: "mon-phu", aliases: ["món phụ", "mon phu"] },
  { name: "Thức Uống", slug: "thuc-uong", aliases: ["thức uống", "thuc uong", "đồ uống", "do uong", "nuoc"] },
];

const menuItems = [
  {
    name: "1 Miếng Gà Giòn",
    slug: "1-mieng-ga-gion",
    aliases: ["1-mieng-ga-gion"],
    price: 35000,
    category: "ga-ran",
    cooking_time: "12-15 phút",
    type: "Món chính",
    description:
      "Gà rán nóng giòn với lớp vỏ vàng rụm, thịt bên trong mềm mọng và đậm vị. Phù hợp gọi riêng hoặc dùng kèm cơm, khoai tây chiên và nước uống.",
  },
  {
    name: "2 Miếng Gà Giòn",
    slug: "2-mieng-ga-gion",
    aliases: ["2-mieng-ga-gion"],
    price: 70000,
    category: "ga-ran",
    cooking_time: "15-20 phút",
    type: "Món chính",
    description:
      "Hai miếng gà rán giòn truyền thống, vỏ ngoài giòn thơm, thịt bên trong mềm nóng. Khẩu phần vừa đủ cho một bữa ăn no hoặc chia sẻ nhẹ.",
  },
  {
    name: "4 Miếng Gà Giòn",
    slug: "4-mieng-ga-gion",
    aliases: ["4-mieng-ga-gion"],
    price: 126000,
    category: "ga-ran",
    cooking_time: "18-22 phút",
    type: "Món nhóm",
    description:
      "Bốn miếng gà rán giòn nóng hổi, phù hợp cho nhóm nhỏ hoặc gia đình. Dùng ngon hơn khi ăn cùng khoai tây chiên, salad bắp cải và nước uống.",
  },
  {
    name: "1 Miếng Gà Sốt Cay",
    slug: "1-mieng-ga-sot-cay",
    aliases: ["1-mieng-ga-sot-cay"],
    price: 35000,
    category: "ga-ran",
    cooking_time: "12-15 phút",
    type: "Món chính",
    description:
      "Một miếng gà rán phủ sốt cay thơm nồng, vị cay vừa đủ và đậm đà. Lựa chọn phù hợp cho khách muốn đổi vị so với gà giòn truyền thống.",
  },
  {
    name: "2 Miếng Gà Sốt Cay",
    slug: "2-mieng-ga-sot-cay",
    aliases: ["2-mieng-ga-sot-cay"],
    price: 70000,
    category: "ga-ran",
    cooking_time: "15-20 phút",
    type: "Món chính",
    description:
      "Hai miếng gà rán phủ sốt cay đậm vị, lớp vỏ giòn thấm sốt và thịt bên trong mềm nóng. Phù hợp cho khách thích vị cay nổi bật.",
  },
  {
    name: "Gà Rút Xương Giòn",
    slug: "ga-rut-xuong-gion",
    price: 47000,
    category: "ga-ran",
    cooking_time: "15-18 phút",
    type: "Món chính",
    description:
      "Gà rút xương chiên giòn, dễ ăn và tiện lợi. Lớp vỏ giòn nhẹ, phần thịt mềm thơm, phù hợp cho bữa nhanh hoặc gọi thêm vào combo.",
  },
  {
    name: "Gà Rút Xương Sốt Cay",
    slug: "ga-rut-xuong-sot-cay",
    price: 49000,
    category: "ga-ran",
    cooking_time: "15-18 phút",
    type: "Món chính",
    description:
      "Gà rút xương phủ sốt cay đậm đà, dễ ăn và không vướng xương. Món hợp với khách thích vị cay, sốt nhiều và tiện dùng.",
  },
  {
    name: "Cơm Gà Giòn",
    slug: "com-ga-gion",
    aliases: ["com-ga-gion"],
    price: 50000,
    category: "ga-ran",
    cooking_time: "15-18 phút",
    type: "Món chính",
    description:
      "Cơm nóng ăn kèm gà rán giòn, rau và sốt dùng kèm. Một phần ăn đầy đủ, dễ chọn cho bữa trưa hoặc bữa tối nhanh gọn.",
  },
  {
    name: "Cơm Gà Mắm Tỏi",
    slug: "com-ga-mam-toi",
    aliases: ["com-ga-mam-toi"],
    price: 45000,
    category: "ga-ran",
    cooking_time: "15-20 phút",
    type: "Món chính",
    description:
      "Cơm nóng dùng cùng gà chiên phủ sốt mắm tỏi mặn ngọt, thơm vị tỏi phi. Hương vị đậm đà, phù hợp khẩu vị Việt.",
  },
  {
    name: "Cơm Gà Sốt Cay",
    slug: "com-ga-sot-cay",
    price: 52000,
    category: "ga-ran",
    cooking_time: "15-20 phút",
    type: "Món chính",
    description:
      "Cơm trắng nóng ăn kèm gà rán sốt cay đậm vị. Khẩu phần no, hương vị rõ ràng, phù hợp cho khách thích món cay.",
  },
  {
    name: "Cơm Gà Rút Xương",
    slug: "com-ga-rut-xuong",
    price: 59000,
    category: "ga-ran",
    cooking_time: "15-20 phút",
    type: "Món chính",
    description:
      "Cơm nóng kết hợp gà rút xương giòn, dễ ăn và tiện lợi. Phần ăn cân bằng giữa cơm, thịt gà và sốt dùng kèm.",
  },
  {
    name: "Cơm Trắng",
    slug: "com-trang",
    aliases: ["com-trang"],
    price: 10000,
    category: "mon-phu",
    cooking_time: "5-8 phút",
    type: "Món phụ",
    description:
      "Phần cơm trắng dẻo mềm, nấu mới mỗi ngày. Phù hợp dùng kèm gà rán, gà sốt cay hoặc các món sốt đậm vị.",
  },
  {
    name: "Burger Gà Giòn",
    slug: "burger-ga-gion",
    price: 42000,
    category: "burger",
    cooking_time: "12-15 phút",
    type: "Món chính",
    description:
      "Burger bánh mềm kẹp gà giòn, rau tươi và sốt béo nhẹ. Hương vị dễ ăn, phù hợp cho bữa nhanh hoặc dùng kèm khoai tây chiên.",
  },
  {
    name: "Burger Tôm",
    slug: "burger-tom",
    aliases: ["burger-tom"],
    price: 45000,
    category: "burger",
    cooking_time: "12-15 phút",
    type: "Món chính",
    description:
      "Burger nhân tôm chiên giòn, thơm vị hải sản, ăn cùng rau tươi và sốt đặc trưng. Lựa chọn ngon miệng khi muốn đổi vị.",
  },
  {
    name: "Burger Bò Phô Mai",
    slug: "burger-bo-pho-mai",
    price: 52000,
    category: "burger",
    cooking_time: "12-15 phút",
    type: "Món chính",
    description:
      "Burger bò áp chảo kèm phô mai, rau tươi và sốt đậm đà. Phần ăn gọn, no vừa và hợp với khách thích vị béo thơm.",
  },
  {
    name: "Combo Sandwich",
    slug: "combo-sandwich",
    aliases: ["combo-sandwich"],
    price: 55000,
    category: "combo-an-nhanh",
    cooking_time: "15-18 phút",
    type: "Combo",
    description:
      "Sandwich nhân đầy đặn dùng kèm món phụ, phù hợp cho bữa ăn nhanh nhưng vẫn đủ no. Hương vị cân bằng, dễ ăn.",
  },
  {
    name: "Mì Ý Sốt Cay",
    slug: "mi-y-sot-cay",
    aliases: ["mi-y-sot-cay"],
    price: 40000,
    category: "mi-y",
    cooking_time: "15-20 phút",
    type: "Món chính",
    description:
      "Mì Ý dai mềm phủ sốt cay béo thơm, vị đậm đà vừa miệng. Phù hợp cho khách thích món nóng, sốt nhiều và có chút cay.",
  },
  {
    name: "Mì Ý Bò Bằm",
    slug: "mi-y-bo-bam",
    price: 45000,
    category: "mi-y",
    cooking_time: "15-18 phút",
    type: "Món chính",
    description:
      "Mì Ý sốt cà chua bò bằm, vị chua ngọt hài hòa và thơm béo nhẹ. Một lựa chọn quen thuộc, dễ ăn cho cả người lớn và trẻ em.",
  },
  {
    name: "Mì Ý Gà Rút Xương",
    slug: "mi-y-ga-rut-xuong",
    aliases: ["mi-y-va-ga-rut-xuong"],
    price: 70000,
    category: "mi-y",
    cooking_time: "18-22 phút",
    type: "Combo",
    description:
      "Mì Ý sốt đậm đà ăn kèm gà rút xương mềm thơm, tiện lợi và no bụng. Phù hợp cho khách muốn một phần ăn nhiều topping.",
  },
  {
    name: "Combo Mì Gà",
    slug: "combo-mi-ga",
    aliases: ["combo-mi-ga"],
    price: 95000,
    category: "combo-an-nhanh",
    cooking_time: "18-22 phút",
    type: "Combo",
    description:
      "Combo gồm mì Ý sốt thơm béo và gà rán nóng giòn, tạo bữa ăn đầy đủ cả tinh bột và đạm. Phù hợp cho bữa trưa hoặc tối.",
  },
  {
    name: "Combo Gà Giòn Khoai Nước",
    slug: "combo-ga-gion-khoai-nuoc",
    aliases: ["2-mieng-ga-gion-va-khoai-tay-chien-va-nuoc"],
    price: 90000,
    category: "combo-an-nhanh",
    cooking_time: "18-22 phút",
    type: "Combo",
    description:
      "Combo gồm 2 miếng gà giòn, khoai tây chiên và nước uống. Hương vị dễ ăn, no bụng, phù hợp cho khách thích gà truyền thống.",
  },
  {
    name: "Combo Gà Cay Khoai Nước",
    slug: "combo-ga-cay-khoai-nuoc",
    aliases: ["2-mieng-ga-sot-cay-va-khoai-tay-chien-va-nuoc"],
    price: 95000,
    category: "combo-an-nhanh",
    cooking_time: "18-22 phút",
    type: "Combo",
    description:
      "Combo đầy đủ gồm 2 miếng gà sốt cay, khoai tây chiên giòn và nước uống. Vị cay đậm đà, khẩu phần no cho một người.",
  },
  {
    name: "Combo Burger Gà",
    slug: "combo-burger-ga",
    price: 79000,
    category: "combo-an-nhanh",
    cooking_time: "15-20 phút",
    type: "Combo",
    description:
      "Burger gà giòn dùng kèm khoai tây chiên và nước uống. Một phần combo gọn, tiện lợi và phù hợp cho bữa ăn nhanh.",
  },
  {
    name: "Combo Gia Đình 6 Miếng Gà",
    slug: "combo-gia-dinh-6-mieng-ga",
    price: 189000,
    category: "combo-an-nhanh",
    cooking_time: "22-25 phút",
    type: "Combo nhóm",
    description:
      "Sáu miếng gà rán giòn dành cho nhóm 3-4 người. Phù hợp dùng chung với khoai tây chiên, salad bắp cải và nước uống.",
  },
  {
    name: "Khoai Tây Chiên",
    slug: "khoai-tay-chien",
    aliases: ["khoai-tay-chien"],
    price: 25000,
    category: "mon-phu",
    cooking_time: "8-10 phút",
    type: "Món phụ",
    description:
      "Khoai tây chiên vàng giòn bên ngoài, mềm bùi bên trong. Dùng nóng cùng tương cà hoặc tương ớt, hợp với mọi combo.",
  },
  {
    name: "Khoai Tây Lắc BBQ Vừa",
    slug: "khoai-tay-lac-bbq-vua",
    aliases: ["khoai-tay-lac-vi-bbq-vua"],
    price: 25000,
    category: "mon-phu",
    cooking_time: "8-10 phút",
    type: "Món phụ",
    description:
      "Khoai tây chiên giòn lắc đều cùng bột BBQ thơm khói, vị mặn ngọt vừa miệng. Phù hợp dùng kèm gà rán hoặc burger.",
  },
  {
    name: "Salad Bắp Cải",
    slug: "salad-bap-cai",
    price: 18000,
    category: "mon-phu",
    cooking_time: "5 phút",
    type: "Món phụ",
    description:
      "Salad bắp cải tươi giòn với vị chua ngọt nhẹ, giúp cân bằng các món chiên. Thích hợp ăn kèm gà rán hoặc combo.",
  },
  {
    name: "Phô Mai Que",
    slug: "pho-mai-que",
    price: 29000,
    category: "mon-phu",
    cooking_time: "8-10 phút",
    type: "Món phụ",
    description:
      "Phô mai que chiên giòn, bên trong béo thơm và có độ kéo sợi hấp dẫn. Món ăn kèm phù hợp cho trẻ em và nhóm bạn.",
  },
  {
    name: "Coca Cola",
    slug: "coca-cola",
    price: 15000,
    category: "thuc-uong",
    cooking_time: "2 phút",
    type: "Đồ uống",
    description:
      "Nước ngọt có gas mát lạnh, dùng kèm gà rán, burger hoặc combo để bữa ăn trọn vị hơn.",
  },
  {
    name: "Trà Đào",
    slug: "tra-dao",
    price: 22000,
    category: "thuc-uong",
    cooking_time: "3-5 phút",
    type: "Đồ uống",
    description:
      "Trà đào mát lạnh với vị ngọt thanh và hương đào thơm nhẹ. Phù hợp dùng kèm các món chiên hoặc burger.",
  },
  {
    name: "Trà Chanh",
    slug: "tra-chanh",
    price: 18000,
    category: "thuc-uong",
    cooking_time: "3-5 phút",
    type: "Đồ uống",
    description:
      "Trà chanh tươi mát, vị chua ngọt nhẹ, giúp cân bằng khẩu vị khi dùng cùng gà rán và khoai tây chiên.",
  },
];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

async function ensureCategories() {
  const existingCategories = await Category.find();
  const bySlug = new Map(existingCategories.map((category) => [category.slug, category]));
  const byName = new Map(
    existingCategories.map((category) => [normalize(category.name), category])
  );
  const result = new Map();

  for (const definition of categoryDefinitions) {
    const aliasKeys = definition.aliases.map(normalize);
    let category =
      bySlug.get(definition.slug) ||
      aliasKeys.map((alias) => byName.get(alias)).find(Boolean);

    if (!category) {
      category = await Category.create({
        name: definition.name,
        slug: definition.slug,
        image: "",
      });
      console.log(`Created category: ${definition.name}`);
    } else {
      category.name = definition.name;
      category.slug = definition.slug;
      category.updated_at = Date.now();
      await category.save();
      console.log(`Updated category: ${definition.name}`);
    }

    result.set(definition.slug, category);
  }

  return result;
}

async function upsertMenu(categories) {
  let updated = 0;
  let created = 0;

  for (const item of menuItems) {
    const slugs = [item.slug, ...(item.aliases || [])];
    const category = categories.get(item.category);
    const existing = await Food.findOne({
      $or: [{ slug: { $in: slugs } }, { name: item.name }],
    });

    const data = {
      name: item.name,
      slug: item.slug,
      price: item.price,
      category: category._id,
      cooking_time: item.cooking_time,
      type: item.type,
      description: item.description,
      show: true,
      updated_at: Date.now(),
    };

    if (existing) {
      await Food.updateOne({ _id: existing._id }, { $set: data });
      updated += 1;
      console.log(`Updated food: ${item.name}`);
    } else {
      await Food.create({
        ...data,
        image: "",
      });
      created += 1;
      console.log(`Created food: ${item.name}`);
    }
  }

  return { updated, created };
}

async function main() {
  await mongoose.connect(dbURI);
  const categories = await ensureCategories();
  const result = await upsertMenu(categories);
  const totalFoods = await Food.countDocuments();
  await mongoose.disconnect();

  console.log(
    `Done. Updated ${result.updated}, created ${result.created}. Total foods: ${totalFoods}.`
  );
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
