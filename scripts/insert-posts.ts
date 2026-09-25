import prisma from "../lib/prisma";
import { generateSlug, sanitizeArticleContent } from "../lib/validations/article";

async function main() {
  console.log("Checking Sectors parent category...");
  const sectorsParent = await prisma.category.findFirst({
    where: { slug: "sectors" },
  });

  const parentId = sectorsParent ? sectorsParent.id : null;

  // 1. Ensure Banking category exists
  let bankingCat = await prisma.category.findFirst({
    where: { OR: [{ slug: "banking" }, { name: "Banking" }] },
  });
  if (!bankingCat) {
    bankingCat = await prisma.category.create({
      data: {
        name: "Banking",
        slug: "banking",
        parentId: parentId,
      },
    });
    console.log("Created category: Banking (banking)");
  } else {
    console.log("Found existing category: Banking");
  }

  // 2. Ensure Infrastructure category exists
  let infraCat = await prisma.category.findFirst({
    where: { OR: [{ slug: "infrastructure" }, { name: "Infrastructure" }] },
  });
  if (!infraCat) {
    infraCat = await prisma.category.create({
      data: {
        name: "Infrastructure",
        slug: "infrastructure",
        parentId: parentId,
      },
    });
    console.log("Created category: Infrastructure (infrastructure)");
  } else {
    console.log("Found existing category: Infrastructure");
  }

  // Check authors
  let author = await prisma.author.findFirst();
  if (!author) {
    author = await prisma.author.create({
      data: {
        name: "Editorial Staff",
        slug: "editorial-staff",
        bio: "GovCorp News Bureau & Editorial Desk",
      },
    });
    console.log("Created default author: Editorial Staff");
  } else {
    console.log("Using author:", author.name);
  }

  // Check companies if available
  const rbiCompany = await prisma.company.findFirst({
    where: { name: { contains: "Bank", mode: "insensitive" } },
  });

  // Post 1 Data
  const post1Title = "September Salaries, Pensions to Be Paid Early Before Three-Day UFBU Bank Strike";
  const post1Slug = generateSlug(post1Title);
  const post1Summary =
    "The Finance Ministry has advanced September salaries and pensions for Central Government employees and pensioners ahead of a proposed three-day UFBU bank strike from September 28–30, 2026, to prevent payment disruptions.";
  const post1Content = `<p>The Finance Ministry has advised the early disbursement of September salaries, wages and pensions for Central Government employees and pensioners ahead of a proposed three-day bank strike by the United Forum of Bank Unions (UFBU) from 28 to 30 September 2026. To prevent disruptions in the payment of salaries and pensions, the Ministry of Finance issued an official memorandum allowing these payments to be made early, on 25 September 2026.</p>
<p>According to the memorandum, Central Government employees and pensioners may receive their salaries and pensions for the current month today. This measure is intended to prevent transaction-related issues during the upcoming UFBU-led strike.</p>
<p>Public Sector Banks (PSBs), such as the State Bank of India, Bank of Baroda and Union Bank of India, may face disruptions from 28 to 30 September. Bank employees will protest for their demands, which include mandatory holidays on all Saturdays, a five-day work week, the removal or revision of the Performance Linked Incentive (PLI) scheme, and an option to switch to the Old Pension Scheme.</p>
<p>The official memorandum also mentioned:</p>
<ol>
  <li>The wages for September 2026 of industrial employees of the Central Government may also be disbursed in advance on 25 September 2026.</li>
  <li>The pension for September 2026 of all Central Government pensioners may also be disbursed by banks or Pay and Accounts Offices (PAOs) on 25 September 2026.</li>
  <li>The salary, wages and pension so disbursed will be treated as advance payments and will be subject to adjustment after the full month's salary, wages or pension of each employee or pensioner is determined.</li>
  <li>As the strike period coincides with the closing days of the current quarter, payments and other banking transactions scheduled towards the end of September 2026 may also be processed in advance, wherever feasible, to avoid delays and disruptions.</li>
</ol>
<p>However, Public Sector Banks will remain open on Sunday, 27 September, as per the government advisory, to reduce inconvenience to customers before the strike.</p>
<p>Private banks not associated with the UFBU will remain functional during the strike days, although customers should check with their respective banks regarding branch operations and transaction-related services.</p>`;

  // Post 2 Data
  const post2Title = "PESB Recommends Nandkumar as Next CMD of Braithwaite Burn & Jessop Construction";
  const post2Slug = generateSlug(post2Title);
  const post2Summary =
    "The Public Enterprise Selection Board has recommended Shri Nandkumar, currently Group General Manager at RITES Limited, for the position of CMD of Braithwaite Burn & Jessop Construction Company Limited, after interviewing nine candidates.";
  const post2Content = `<p>The Public Enterprise Selection Board (PESB) has recommended Shri Nandkumar for the position of Chairman and Managing Director (CMD) of Braithwaite Burn & Jessop Construction Company Limited (Schedule C).</p>
<p>The recommendation was finalized during a meeting held on September 25, 2026.</p>
<p>Shri Nandkumar, currently the Group General Manager at RITES Limited, Mumbai, was selected after an extensive interview process conducted by the selection board.</p>
<p>A total of nine candidates were interviewed in the process. The full list includes:</p>
<ol>
  <li>Shri Sujit Kumar Ghosh, Director (Finance), Braithwaite Burn & Jessop Construction Company Limited</li>
  <li>Shri Amanpreet Singh Chopra, Senior General Manager, New Delhi, Engineers India Limited</li>
  <li>Shri Nandkumar, Group General Manager, Mumbai, RITES Limited</li>
  <li>Shri Mahesh Kumar, Chief General Manager (Project Head), Mokama, Ircon International Limited</li>
  <li>Shri Sushil Yadav, Group General Manager, RITES Limited</li>
  <li>Shri Vishwajit Kumar, General Manager, Mecon Limited</li>
  <li>Shri Rakesh Kumar, General Manager, Engineering Projects (India) Limited</li>
  <li>Dr. Rajnish Kumar, Deputy General Manager, Aviation, Northern Region Office, Delhi, Indian Oil Corporation Limited</li>
  <li>Commodore Ashish Goyal, Directing Staff (Navy), Army War College, Mhow</li>
</ol>
<p>Braithwaite Burn & Jessop Construction Company Limited is a prominent engineering and construction firm known for executing major infrastructure projects across India, including the iconic Howrah Bridge.</p>
<p>Nandkumar will now move forward with the further regulatory clearances before his official appointment.</p>`;

  // Upsert Post 1
  const existingPost1 = await prisma.article.findUnique({
    where: { slug: post1Slug },
  });

  const post1 = existingPost1
    ? await prisma.article.update({
        where: { id: existingPost1.id },
        data: {
          title: post1Title,
          summary: post1Summary,
          content: sanitizeArticleContent(post1Content),
          categoryId: bankingCat.id,
          authorId: author.id,
          status: "published",
          publishedAt: existingPost1.publishedAt || new Date("2026-09-25T13:30:00Z"),
          imageUrl: null,
        },
      })
    : await prisma.article.create({
        data: {
          title: post1Title,
          slug: post1Slug,
          summary: post1Summary,
          content: sanitizeArticleContent(post1Content),
          categoryId: bankingCat.id,
          authorId: author.id,
          status: "published",
          publishedAt: new Date("2026-09-25T13:30:00Z"),
          imageUrl: null,
        },
      });

  console.log(`✅ Post 1 saved: "${post1.title}" (ID: ${post1.id}, Slug: ${post1.slug})`);

  // Upsert Post 2
  const existingPost2 = await prisma.article.findUnique({
    where: { slug: post2Slug },
  });

  const post2 = existingPost2
    ? await prisma.article.update({
        where: { id: existingPost2.id },
        data: {
          title: post2Title,
          summary: post2Summary,
          content: sanitizeArticleContent(post2Content),
          categoryId: infraCat.id,
          authorId: author.id,
          status: "published",
          publishedAt: existingPost2.publishedAt || new Date("2026-09-25T13:35:00Z"),
          imageUrl: null,
        },
      })
    : await prisma.article.create({
        data: {
          title: post2Title,
          slug: post2Slug,
          summary: post2Summary,
          content: sanitizeArticleContent(post2Content),
          categoryId: infraCat.id,
          authorId: author.id,
          status: "published",
          publishedAt: new Date("2026-09-25T13:35:00Z"),
          imageUrl: null,
        },
      });

  console.log(`✅ Post 2 saved: "${post2.title}" (ID: ${post2.id}, Slug: ${post2.slug})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
