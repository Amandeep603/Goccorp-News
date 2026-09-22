import { PrismaClient } from "@prisma/client";
import { sanitizeArticleContent } from "../lib/validations/article";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seedRealArticles script...\n");

  // a) Find or create Author record: Aditya Mohapatra
  let author = await prisma.author.findFirst({
    where: { name: "Aditya Mohapatra" },
  });

  if (!author) {
    author = await prisma.author.create({
      data: {
        name: "Aditya Mohapatra",
        slug: "aditya-mohapatra",
        bio: "Correspondent",
      },
    });
    console.log(`✅ Created author: ${author.name} (ID: ${author.id})`);
  } else if (!author.slug) {
    author = await prisma.author.update({
      where: { id: author.id },
      data: { slug: "aditya-mohapatra" },
    });
    console.log(`ℹ️ Updated author slug: ${author.name} -> ${author.slug}`);
  } else {
    console.log(`ℹ️ Found existing author: ${author.name} (ID: ${author.id}, slug: ${author.slug})`);
  }

  // b) Find or create Company record for ONGC
  const ongc = await prisma.company.upsert({
    where: { slug: "ongc" },
    update: {
      name: "Oil and Natural Gas Corporation",
      sector: "Oil & Gas",
    },
    create: {
      name: "Oil and Natural Gas Corporation",
      slug: "ongc",
      sector: "Oil & Gas",
    },
  });
  console.log(`✅ Company ready: ${ongc.name} (${ongc.slug}) (ID: ${ongc.id})`);

  // c) Find Category with slug "aviation"
  const aviationCategory = await prisma.category.findUnique({
    where: { slug: "aviation" },
  });
  if (!aviationCategory) {
    console.error("❌ Error: Category with slug 'aviation' not found.");
    process.exit(1);
  }
  console.log(`✅ Found category 'aviation' (ID: ${aviationCategory.id})`);

  // d) Find Category with slug "oil-gas"
  const oilGasCategory = await prisma.category.findUnique({
    where: { slug: "oil-gas" },
  });
  if (!oilGasCategory) {
    console.error("❌ Error: Category with slug 'oil-gas' not found.");
    process.exit(1);
  }
  console.log(`✅ Found category 'oil-gas' (ID: ${oilGasCategory.id})`);

  // e) Article #1 content
  const article1RawContent = `<p>The Union Civil Aviation Minister, K Rammohan Naidu, on Tuesday claimed that India will build 100 airports in the next ten years under the central government's regional connectivity scheme UDAN. The scheme will have an outlay of about Rs 30,000 crore.</p>
<p>Naidu inaugurated India's third "hub & spoke" operation at Ahmedabad airport. "While there were 74 airports in 2014, today we can proudly say that India's map features 166 airports. Going from 74 to 166 set a record for the country. Over the last 12 years, we completed work on a new airport or a new terminal roughly every 40 days," he said at the event.</p>
<p>"This 12-year journey was merely the beginning for the Ministry of Civil Aviation. We have expanded upon the revolutionary changes brought to the air travel sector by the 'UDAN' scheme over the past decade. Looking ahead, we plan to spend approximately Rs 30,000 crore over the next 10 years to build 100 new airports," the union minister added.</p>
<p>During the Union Cabinet meeting chaired by Prime Minister Narendra Modi in March, the house approved the launch and implementation of the revised Regional Connectivity Scheme- Modified UDAN- for a period of 10 years from FY 2026-27 to FY 2035-36, with a total outlay of Rs 28,840 crore, and the budgetary support of the centre.</p>
<p>Naidu, during his speech, emphasised connecting passengers seamlessly to international destinations. He said that civil aviation is the fastest-growing sector in the country; the public demand is no longer just for a railway station or a train station in their town but for an airport in their town.</p>
<p>The demand mainly comes from tier-2 and tier-3 cities, Himalayan areas, remote locations, and islands like Andaman and Lakshadweep. Naidu claimed the need as "The voice of Modern India" and assured that the ministry is listening to it and formulating policies accordingly.</p>
<p>Stressing the "hub & spoke" model, the Union Minister said that connectivity plays a major role in today's day and age. Hence, the model is effective in connecting domestic flights to a single hub, which then further makes international travel hassle-free.</p>
<p>The model was first implemented at Varanasi, followed by Amritsar, where it received many positive reviews, the minister noted.</p>
<p>Ahmedabad was an ideal choice for the ministry because a large number of the NRI community from the state of Gujarat is spread across the globe, and there were constant requests for connectivity from the region.</p>
<p>"Its impact extends across various sectors, connecting a diverse range of people to the airport within a city. Advancing airports and aviation means advancing the entire nation - such is the power of our civil aviation sector," he said, adding that Gujarat plays a pivotal role in the National Civil Aviation Policy.</p>
<p>Gujarat Chief Minister Bhupendra Patel and Deputy CM Harsh Sanghavi were also present at the event.</p>`;

  // f) Article #2 content
  const article2RawContent = `<p><strong>New Delhi:</strong> According to an official memorandum issued, seven names have been shortlisted and are in contention for the post of Chairman and Managing Director of the Oil and Natural Gas Corporation (ONGC).</p>
<p>The shortlisted candidates include: Ranjit Rath, Chairman and Managing Director (CMD) of Oil India Limited; Rajshri Gupta, Managing Director of ONGC Videsh; and Vikram Saxena, Director for Technology and Field Services. They are followed by Satyam Kumar, Director for Strategy and Corporate Affairs; Dulal Halder, Director for Operations at ONGC Videsh; Devendra Kumar, Director for Finance at Mangalore Refinery and Petrochemicals Limited (MRPL); and SP Shrivastava, Director for Marketing at Indian Oil Corporation Limited (IOCL).</p>
<p>Among the candidates, Ranjit Rath is applying for the post for the second consecutive time after being shortlisted in the previous cycle; and Rajshri Gupta became eligible after the age criteria was raised to 59.</p>
<p>After the government reworked the eligibility criteria for the opening, it also widened the pool for applications for the opening; candidates from other central public sector undertakings, state-owned energy companies, and private sector energy firms were all made eligible. However, there were no private takers, as all seven shortlisted individuals belonged to ONGC and the petroleum public sector.</p>
<p>The memorandum also mentioned the formation of a Search-Cum-Selection Committee (SCSC), which will preside over the appointment. The committee trio will include the chairperson of the Public Enterprises Selection Board (PESB) as the Chairperson, the secretary of the Ministry of Petroleum and Natural Gas as an ex officio member, and an outside expert described as a former chairman of Indian Oil Corporation Limited (IOCL).</p>
<p>This committee would make the appointment rather than the PSEB's standard selection process. ONGC last went through a full CMD selection process in 2022. The committee then comprised PSEB Chairperson Mallika Srinivasan, Petroleum Secretary Pankaj Jain, and former Indian Oil Chairman B Ashok as the outside expert.</p>
<p>The applications were closed in late June; however, the chair will vacate the post on December 7, 2026. Arun Kumar Singh currently serves as Chairman and Managing Director of ONGC. Singh joined the company in 2022; formerly, he was the chairman of Bharat Petroleum Corporation Limited (BPCL). He became the first person to head a Maharatna public sector undertaking after retirement and was given a one-year extension in December 2025.</p>`;

  // g) Sanitize both content strings with existing sanitize-html setup
  const article1SanitizedContent = sanitizeArticleContent(article1RawContent);
  const article2SanitizedContent = sanitizeArticleContent(article2RawContent);

  const now = new Date();

  // h) Upsert Article #1
  const article1 = await prisma.article.upsert({
    where: { slug: "india-to-get-100-new-airports-in-10-years" },
    update: {
      title: "India to get 100 new airports in 10 years: Civil Aviation Minister",
      summary: "People now want an airport in their towns; the public demands are much more than just railway stations.",
      content: article1SanitizedContent,
      authorId: author.id,
      categoryId: aviationCategory.id,
      status: "published",
      isFeatured: true,
      publishedAt: now,
    },
    create: {
      title: "India to get 100 new airports in 10 years: Civil Aviation Minister",
      slug: "india-to-get-100-new-airports-in-10-years",
      summary: "People now want an airport in their towns; the public demands are much more than just railway stations.",
      content: article1SanitizedContent,
      authorId: author.id,
      categoryId: aviationCategory.id,
      status: "published",
      isFeatured: true,
      publishedAt: now,
    },
  });

  // Upsert Article #2
  const article2 = await prisma.article.upsert({
    where: { slug: "ongc-chairman-race-heats-up-seven-names-in-line" },
    update: {
      title: "ONGC Chairman Race Heats Up: Seven Names In Line For The Next Term",
      summary: "Seven candidates are shortlisted for the post of Chairman and Managing Director of Oil and Natural Gas Corporation (ONGC), which becomes vacant in December.",
      content: article2SanitizedContent,
      authorId: author.id,
      categoryId: oilGasCategory.id,
      companyId: ongc.id,
      status: "published",
      isFeatured: true,
      publishedAt: now,
    },
    create: {
      title: "ONGC Chairman Race Heats Up: Seven Names In Line For The Next Term",
      slug: "ongc-chairman-race-heats-up-seven-names-in-line",
      summary: "Seven candidates are shortlisted for the post of Chairman and Managing Director of Oil and Natural Gas Corporation (ONGC), which becomes vacant in December.",
      content: article2SanitizedContent,
      authorId: author.id,
      categoryId: oilGasCategory.id,
      companyId: ongc.id,
      status: "published",
      isFeatured: true,
      publishedAt: now,
    },
  });

  // i) Print success message with both articles' slugs
  console.log("\n==================================================");
  console.log("🚀 Articles successfully seeded!");
  console.log(`1. [${article1.title}] -> slug: ${article1.slug}`);
  console.log(`2. [${article2.title}] -> slug: ${article2.slug}`);
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Failed to seed real articles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
