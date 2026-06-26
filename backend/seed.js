const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Article = require('./models/Article');
const ForumPost = require('./models/ForumPost');
const Comment = require('./models/Comment');

dotenv.config();

const usersData = [
  {
    name: 'Prince Admin',
    email: 'admin@trillioty.in',
    password: 'password123',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 150,
    headline: 'Editor-in-Chief @ Trillioty Prime',
    bio: 'Passionate about structural media reform, investigative journalism, and digital public policy in India.',
  },
  {
    name: 'Aishwarya Editor',
    email: 'editor@trillioty.in',
    password: 'password123',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 98,
    headline: 'Senior Editorial Coordinator',
    bio: 'Curating long-form magazine essays and verifying citizen news wires across central India.',
  },
  {
    name: 'Rajesh Writer',
    email: 'rajesh@trillioty.in',
    password: 'password123',
    role: 'Author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 45,
    headline: 'Independent Tech Columnist',
    bio: 'Writing on the intersections of Indian technology startups, fintech adoption, and public software rails.',
  },
  {
    name: 'Amit Kumar',
    email: 'amit@gmail.com',
    password: 'password123',
    role: 'Reader',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 12,
    headline: 'Citizen Journalist & Policy Analyst',
    bio: 'Active reader and commenter, focusing on local infrastructural growth and regional development boards.',
  },
  {
    name: 'Ramesh Yadav',
    email: 'ramesh@gmail.com',
    password: 'password123',
    role: 'Reader',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 35,
    headline: 'Lucknow Vegetable Mandi Tea Stall Owner',
    bio: 'Serving tea and community chats daily. Sharing market vegetable price updates and local vendor stories.',
  },
  {
    name: 'Sunita Devi',
    email: 'sunita@gmail.com',
    password: 'password123',
    role: 'Reader',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 42,
    headline: 'Rural Leader, Bihar Women\'s Handloom Cooperative',
    bio: 'Homemaker and cooperative head. Working for school book donations, rural clean water, and handloom training.',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@gmail.com',
    password: 'password123',
    role: 'Reader',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 28,
    headline: 'Organic Wheat Farmer from Bhatinda, Punjab',
    bio: 'Practicing natural organic farming. Sharing realities of diesel prices, rains, seed options, and mandi wholesale rates.',
  },
  {
    name: 'Pooja Sharma',
    email: 'pooja@gmail.com',
    password: 'password123',
    role: 'Reader',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 18,
    headline: 'DU Student & Public Transit Safety Advocate',
    bio: 'College student. Guide for Delhi Metro routes, cheap street food hubs, and safe travel tips for students.',
  },
];

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trillioty-prime');
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Article.deleteMany();
    await ForumPost.deleteMany();
    await Comment.deleteMany();
    console.log('Cleared existing collections.');

    // Seed Users (we manually trigger hashing by saving Mongoose documents)
    const seededUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      seededUsers.push(user);
    }
    console.log('Users seeded.');

    const adminUser = seededUsers[0];
    const editorUser = seededUsers[1];
    const authorUser = seededUsers[2];
    const readerUser = seededUsers[3];
    const rameshUser = seededUsers[4];
    const sunitaUser = seededUsers[5];
    const vikramUser = seededUsers[6];
    const poojaUser = seededUsers[7];

    // Seed Articles
    const articlesData = [
      {
        title: "The Digital Revolution of India's FinTech Sector",
        summary: "An in-depth look at how unified payments interface (UPI) and local digital banking transformed millions of rural lives.",
        content: `<h3>The UPI Era: Bridging the Divide</h3>
        <p>In the last five years, India has witnessed a monumental shift in financial inclusion, largely driven by the Unified Payments Interface (UPI). From local tea stalls (Tapri) to multi-million dollar corporations, instant mobile payments have become the default standard.</p>
        <blockquote>"The democratization of financial transactions has empowered the smallest vendors, making cash-dependency a relic of the past."</blockquote>
        <h3>Rural Inclusion</h3>
        <p>Historically, rural banking in India required long commutes and hours of waiting in branch queues. Today, with cheap mobile internet and micro-ATM systems, a farmer in Odisha can receive direct crop subsidies in their bank account and pay for fertilizers with a quick QR code scan.</p>
        <p>The MERN-stack and other modern software paradigms allow agencies to scale payment interfaces, database logging, and API endpoints to handle billions of transactions monthly. As India moves forward, the focus is now transitioning to credit enablement and wealth management on top of the payment rails.</p>`,
        bannerImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
        author: authorUser._id,
        type: 'Magazine',
        category: 'Business',
        tags: ['Fintech', 'UPI', 'DigitalIndia'],
        isFeatured: true,
        readTime: 5,
        status: 'Published',
      },
      {
        title: "Tech Hub Bengaluru Faces Pre-Monsoon Showers, Infrastructure Alert Issued",
        summary: "Moderate rainfall brings respite from summer heat but triggers waterlogging warnings across major IT corridors.",
        content: `<p>Bengaluru experienced moderate to heavy pre-monsoon showers on Friday, bringing relief from the persistent heat but leading to immediate municipal challenges.</p>
        <p>Waterlogging was reported along the Outer Ring Road (ORR) and elements of Whitefield, which host some of the country's largest technology parks. Local municipal authorities (BBMP) have deployed pump crews to clear stagnant water, urging commuters to exercise caution or negotiate work-from-home options with employers.</p>
        <p>Traffic police issued travel updates highlighting key choke points. Meanwhile, weather officials predict continued cloudy skies and scattered rain over the weekend.</p>`,
        bannerImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
        author: editorUser._id,
        type: 'News',
        category: 'National',
        tags: ['Bengaluru', 'Weather', 'Infrastructure'],
        isFeatured: false,
        readTime: 2,
        status: 'Published',
      },
      {
        title: "Indian Space Research Agency Prepares for Next Launch Expedition",
        summary: "ISRO gears up to launch next-generation Earth observation satellites for farming analytics.",
        content: `<p>The Indian Space Research Organisation (ISRO) has commenced the launch countdown for its Polar Satellite Launch Vehicle (PSLV) mission, carrying the EOS-08 satellite.</p>
        <p>According to space scientists, this Earth Observation Satellite is equipped with advanced infrared sensors designed to study soil moisture, forest fire hazards, and agricultural health indicators across the Indian subcontinent.</p>
        <p>This mission continues India's momentum in expanding space technology for civilian utility, reinforcing our digital public infrastructure capabilities.</p>`,
        bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        author: adminUser._id,
        type: 'News',
        category: 'Tech',
        tags: ['ISRO', 'Space', 'Science'],
        isFeatured: false,
        readTime: 3,
        status: 'Published',
      },
      {
        title: "Forgotten Recipes: Rediscovering India's Regional Culinary Heritage",
        summary: "Tracing the origin of unique heirloom recipes passed down through generations in coastal Odisha and internal Maharashtra.",
        content: `<h3>Heirloom Culinary Traditions</h3>
        <p>Across the diverse cultural landscape of India, cuisine has often been passed down via oral traditions and hands-on teaching, with few formal recipe records. As modern lifestyles prevail, many regional preparations face extinction.</p>
        <p>In this editorial feature, we explore coastal Odisha's traditional slow-cooked lentils (Dalma) cooked in earthenware, and the spicy, peanut-rich internal Maharashtrian vegetarian preparations (Shena chi Bhaji) which showcase the depth of local spice blending.</p>
        <p>By documenting these culinary crafts, culinary historians hope to restore interest in organic, indigenous grains and cooking styles that benefit local farmer cooperatives.</p>`,
        bannerImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        author: authorUser._id,
        type: 'Magazine',
        category: 'Culture',
        tags: ['Food', 'Culture', 'Heritage'],
        isFeatured: false,
        readTime: 6,
        status: 'Published',
      },
    ];

    const seededArticles = [];
    for (const a of articlesData) {
      const article = new Article(a);
      await article.save();
      seededArticles.push(article);
    }
    console.log('Articles seeded.');

    // Seed Forum Posts
    const forumPostsData = [
      {
        title: "Is India's startup ecosystem cooling down or maturing?",
        content: "With funding rounds getting smaller and a bigger focus on path to profitability, are we entering a mature phase of sustainable business creation in India? Discuss.",
        author: readerUser._id,
        category: 'Business',
        tags: ['Startups', 'Funding'],
        upvotes: [adminUser._id, editorUser._id],
        downvotes: [],
        hypeCount: 40,
      },
      {
        title: "How do you handle waterlogging and commute issues in IT parks during monsoons?",
        content: "Rains are around the corner in Bengaluru and Hyderabad. What are your hacks to commute or negotiate with managers for WFH? Share your experience.",
        author: readerUser._id,
        category: 'General',
        tags: ['Commute', 'Workplace'],
        upvotes: [editorUser._id, authorUser._id, adminUser._id],
        downvotes: [],
        hypeCount: 80,
      },
      {
        title: "Lucknow vegetable mandi pricing & digital payment convenience",
        content: "Today tomato prices hit ₹40/kg in Lucknow. The good news is that almost all small cart pullers here are using digital QR codes now. It saves us from arguments about change (Chutta paise). How is it in your local markets? #LocalMandi #DigitalIndia",
        author: rameshUser._id,
        category: 'General',
        tags: ['LocalMandi', 'DigitalIndia'],
        upvotes: [adminUser._id, readerUser._id],
        downvotes: [],
        hypeCount: 50,
      },
      {
        title: "Direct crop selling options and wholesale warehouse facilities",
        content: "We need better cold storage units in Punjab. Right now, if we do not sell wheat immediately, monsoons destroy the bags. Any tips on cooperative storage options? #PunjabFarming #Agriculture",
        author: vikramUser._id,
        category: 'National',
        tags: ['PunjabFarming', 'Agriculture'],
        upvotes: [editorUser._id],
        downvotes: [],
        hypeCount: 20,
      },
      {
        title: "Setting up a community book library for children in our village",
        content: "We started a small reading club for village children in our village school. We need donations of primary science and Hindi story books. If anyone wants to send books, please message me directly! #RuralEducation #Community",
        author: sunitaUser._id,
        category: 'Culture',
        tags: ['RuralEducation', 'Community'],
        upvotes: [adminUser._id, editorUser._id, readerUser._id],
        downvotes: [],
        hypeCount: 95,
      },
      {
        title: "Best pocket-friendly street food joints near North Campus Delhi University",
        content: "If you are new to Delhi University, here are my top 3 cheap places: Chache Di Hatti for Chole Bhature (₹50), Sudama Tea Stall (₹15), and Tom Uncle Maggi Point. What is your go-to hangout spot? #DelhiUniversity #StudentLife",
        author: poojaUser._id,
        category: 'Culture',
        tags: ['DelhiUniversity', 'StudentLife'],
        upvotes: [rameshUser._id],
        downvotes: [],
        hypeCount: 75,
      },
    ];

    const seededForumPosts = [];
    for (const fp of forumPostsData) {
      const post = new ForumPost(fp);
      await post.save();
      seededForumPosts.push(post);
    }
    console.log('Forum Posts seeded.');

    // Seed Comments
    const comment1 = await Comment.create({
      content: "Excellent article on UPI! The micro-transactions are indeed a game changer.",
      author: readerUser._id,
      articleId: seededArticles[0]._id,
      upvotes: [authorUser._id],
    });

    const reply1 = await Comment.create({
      content: "Thanks Amit! Indeed, the scaling power of the system is unmatched worldwide.",
      author: authorUser._id,
      articleId: seededArticles[0]._id,
      parentId: comment1._id,
      upvotes: [readerUser._id],
    });

    const forumComment1 = await Comment.create({
      content: "I think it is maturing. The era of cash-burning customer acquisition is thankfully behind us.",
      author: authorUser._id,
      postId: seededForumPosts[0]._id,
      upvotes: [adminUser._id],
    });

    // Update commentsCount for forum posts
    seededForumPosts[0].commentsCount = 1;
    await seededForumPosts[0].save();

    console.log('Comments seeded.');

    // Seed Direct Messages
    const DirectMessage = require('./models/DirectMessage');
    await DirectMessage.deleteMany();
    await DirectMessage.create({
      sender: adminUser._id,
      recipient: readerUser._id,
      message: "Hello Amit! I saw your comments on the UPI article. Very well written.",
    });
    await DirectMessage.create({
      sender: readerUser._id,
      recipient: adminUser._id,
      message: "Thank you Prince! Appreciate your feedback. I am working on a new Charcha thread on IT park transit solutions.",
    });
    await DirectMessage.create({
      sender: adminUser._id,
      recipient: sunitaUser._id,
      message: "Hello Sunita ji! We saw your post about the library. We can donate 100 books from our office library. How should we ship them?",
    });
    await DirectMessage.create({
      sender: sunitaUser._id,
      recipient: adminUser._id,
      message: "Dhanyawad Prince babu! That would be so helpful. You can send them to the block development office in Patna, care of our cooperative name.",
    });
    await DirectMessage.create({
      sender: poojaUser._id,
      recipient: readerUser._id,
      message: "Hey Amit, I saw your post on public transit. Are you planning to write a post on women's safety on evening bus routes?",
    });
    await DirectMessage.create({
      sender: readerUser._id,
      recipient: poojaUser._id,
      message: "Hi Pooja! Yes, definitely. I'm compiling some data on bus shelter lighting. Would love to get your input on safety concerns near DU campuses.",
    });
    console.log('Direct Messages seeded.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
