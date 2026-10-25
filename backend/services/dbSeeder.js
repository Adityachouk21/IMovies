import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Show } from '../models/Show.js';
import { Review } from '../models/Review.js';

export const seedInitialData = async ({ force = false } = {}) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[Seeder] Skipping database seed: MongoDB is not connected.');
    return { success: false, reason: 'MongoDB is not connected' };
  }

  try {
    const existingMoviesCount = await Movie.countDocuments();
    if (existingMoviesCount > 0 && !force) {
      console.log(`[Seeder] Database already populated with ${existingMoviesCount} movies. Skipping automatic seed.`);
      return { success: true, skipped: true, movieCount: existingMoviesCount };
    }

    console.log(`[Seeder] Starting ${force ? 'forced re-seed' : 'initial auto-seed'} of database...`);

    if (force) {
      console.log('[Seeder] Clearing existing cinema collections...');
      await Promise.all([
        Movie.deleteMany({}),
        Theater.deleteMany({}),
        Screen.deleteMany({}),
        Seat.deleteMany({}),
        Show.deleteMany({}),
        Review.deleteMany({}),
        User.deleteMany({})
      ]);
    }

    // Clean up legacy indexes on User collection if present
    try {
      await User.collection.dropIndex('username_1');
      console.log('[Seeder] Dropped legacy username_1 index from users collection.');
    } catch (e) {
      // index does not exist or already dropped, ignore safely
    }

    try {
      await Movie.collection.dropIndexes();
      console.log('[Seeder] Re-syncing Movie collection indexes with language_override: none.');
    } catch (e) {
      // ignore
    }

    // 1. Seed Users (Admin & Demo)
    console.log('[Seeder] Creating admin & demo customer accounts...');
    const adminPasswordHash = await User.hashPassword('Admin@12345');
    const demoPasswordHash = await User.hashPassword('User@12345');

    const [adminUser, demoUser] = await Promise.all([
      User.findOneAndUpdate(
        { email: 'admin@imovies.com' },
        {
          name: 'iMovies Admin',
          email: 'admin@imovies.com',
          phone: '+91 9876543210',
          passwordHash: adminPasswordHash,
          role: 'admin',
          accountStatus: 'active'
        },
        { upsert: true, new: true }
      ),
      User.findOneAndUpdate(
        { email: 'demo@imovies.com' },
        {
          name: 'Rohan Sharma',
          email: 'demo@imovies.com',
          phone: '+91 9822334455',
          passwordHash: demoPasswordHash,
          role: 'user',
          accountStatus: 'active'
        },
        { upsert: true, new: true }
      )
    ]);

    // 2. Movie List (16 rich titles)
    const moviesData = [
      {
        title: 'Interstellar: Beyond Horizons',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 169,
        releaseDate: new Date('2024-11-07'),
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        director: 'Christopher Nolan',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        ageRating: 'UA',
        averageRating: 4.9,
        totalRatings: 1842,
        movieStatus: 'now_showing'
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'A listless Wade Wilson toils in civilian life with his days as the morally flexible mercenary Deadpool behind him. When his homeworld faces an existential threat, he must reluctantly suit-up alongside an even more reluctant Wolverine.',
        genre: ['Action', 'Comedy', 'Sci-Fi'],
        language: 'English',
        duration: 128,
        releaseDate: new Date('2024-07-26'),
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
        director: 'Shawn Levy',
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        ageRating: 'A',
        averageRating: 4.8,
        totalRatings: 4890,
        movieStatus: 'now_showing'
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        releaseDate: new Date('2024-07-21'),
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        director: 'Christopher Nolan',
        posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        ageRating: 'A',
        averageRating: 4.8,
        totalRatings: 2310,
        movieStatus: 'now_showing'
      },
      {
        title: 'Pushpa 2: The Rule',
        description: 'Pushpa Raj cements his fearless reign over the red sandalwood empire while dynamic SP Bhanwar Singh Shekhawat launches a furious personal vendetta to bring him down.',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'Telugu',
        duration: 185,
        releaseDate: new Date('2024-12-05'),
        cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Jagapathi Babu'],
        director: 'Sukumar',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=1kVK0MZlbI4',
        ageRating: 'UA',
        averageRating: 4.9,
        totalRatings: 6320,
        movieStatus: 'now_showing'
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        genre: ['Action', 'Drama', 'Adventure'],
        language: 'English',
        duration: 148,
        releaseDate: new Date('2024-11-22'),
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        director: 'Ridley Scott',
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        ageRating: 'A',
        averageRating: 4.7,
        totalRatings: 2150,
        movieStatus: 'now_showing'
      },
      {
        title: 'Stree 2: Sarkate Ka Aatank',
        description: 'The historic town of Chanderi is gripped by pure terror as a headless demon known as Sarkata starts abducting women. Vicky, Bittu, Jana and the enigmatic Stree must unite.',
        genre: ['Comedy', 'Horror'],
        language: 'Hindi',
        duration: 147,
        releaseDate: new Date('2024-08-15'),
        cast: ['Shraddha Kapoor', 'Rajkummar Rao', 'Pankaj Tripathi', 'Aparshakti Khurana'],
        director: 'Amar Kaushik',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=KVnheQhQlCY',
        ageRating: 'UA',
        averageRating: 4.7,
        totalRatings: 5410,
        movieStatus: 'now_showing'
      },
      {
        title: 'Kalki 2898 AD',
        description: 'A modern avatar of Vishnu, a Hindu god, who is believed to have descended to earth in the year 2898 AD to protect the world from evil forces.',
        genre: ['Sci-Fi', 'Action', 'Mythology'],
        language: 'Telugu',
        duration: 181,
        releaseDate: new Date('2024-06-27'),
        cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
        director: 'Nag Ashwin',
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        ageRating: 'UA',
        averageRating: 4.7,
        totalRatings: 3450,
        movieStatus: 'now_showing'
      },
      {
        title: 'Jawan',
        description: 'A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.',
        genre: ['Action', 'Thriller'],
        language: 'Hindi',
        duration: 169,
        releaseDate: new Date('2024-09-07'),
        cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
        director: 'Atlee',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=MWOlnZSnXWE',
        ageRating: 'UA',
        averageRating: 4.6,
        totalRatings: 4200,
        movieStatus: 'now_showing'
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: 'English',
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        director: 'Denis Villeneuve',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        ageRating: 'UA',
        averageRating: 4.9,
        totalRatings: 2890,
        movieStatus: 'now_showing'
      },
      {
        title: 'Leo',
        description: 'A mild-mannered cafe owner becomes a local hero through an act of violence, which sets off consequences with a dangerous crime syndicate.',
        genre: ['Action', 'Crime', 'Thriller'],
        language: 'Tamil',
        duration: 164,
        releaseDate: new Date('2024-10-19'),
        cast: ['Thalapathy Vijay', 'Sanjay Dutt', 'Trisha Krishnan', 'Arjun Sarja'],
        director: 'Lokesh Kanagaraj',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Po3jVhF07jU',
        ageRating: 'A',
        averageRating: 4.5,
        totalRatings: 3100,
        movieStatus: 'now_showing'
      },
      {
        title: 'Moana 2',
        description: 'After receiving an unexpected call from her ancestral wayfinders, Moana journeys to the far seas of Oceania and into dangerous, uncharted waters for an adventure unlike anything she has ever faced.',
        genre: ['Animation', 'Adventure', 'Family', 'Musical'],
        language: 'English',
        duration: 100,
        releaseDate: new Date('2024-11-27'),
        cast: ['Auliʻi Cravalho', 'Dwayne Johnson', 'Alan Tudyk', 'Temuera Morrison'],
        director: 'David Derrick Jr.',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=hDZ7y8RP5HE',
        ageRating: 'U',
        averageRating: 4.6,
        totalRatings: 1820,
        movieStatus: 'now_showing'
      },
      {
        title: 'Wicked',
        description: 'The untold story of the witches of Oz: Elphaba, a young woman misunderstood because of her green skin, and Glinda, a popular girl gilded by privilege, who become unlikely friends before fate tests their bond.',
        genre: ['Fantasy', 'Musical', 'Romance'],
        language: 'English',
        duration: 160,
        releaseDate: new Date('2024-11-22'),
        cast: ['Cynthia Erivo', 'Ariana Grande', 'Jeff Goldblum', 'Jonathan Bailey'],
        director: 'Jon M. Chu',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=6COmYeLsz4c',
        ageRating: 'PG-13',
        averageRating: 4.8,
        totalRatings: 2680,
        movieStatus: 'now_showing'
      },
      {
        title: 'The Dark Knight: Legacy',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 152,
        releaseDate: new Date('2024-07-18'),
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Gary Oldman'],
        director: 'Christopher Nolan',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        ageRating: 'UA',
        averageRating: 4.9,
        totalRatings: 5200,
        movieStatus: 'now_showing'
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, encountering a team of Spider-People charged with protecting its very existence.',
        genre: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        duration: 140,
        releaseDate: new Date('2025-05-15'),
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        director: 'Joaquim Dos Santos',
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        ageRating: 'U',
        averageRating: 4.8,
        totalRatings: 950,
        movieStatus: 'coming_soon'
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'Jake Sully and Neytiri return to Pandora to explore the volcanic Ash People and face unforeseen challenges in their struggle for peace.',
        genre: ['Sci-Fi', 'Action', 'Fantasy'],
        language: 'English',
        duration: 195,
        releaseDate: new Date('2025-12-19'),
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
        director: 'James Cameron',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        ageRating: 'UA',
        averageRating: 4.7,
        totalRatings: 1100,
        movieStatus: 'coming_soon'
      },
      {
        title: 'Brahmastra: Part Two - Dev',
        description: 'The ancient Indian Astras face their greatest test as the mythological origin of Dev is unveiled amidst cosmic warfare.',
        genre: ['Fantasy', 'Action', 'Adventure'],
        language: 'Hindi',
        duration: 170,
        releaseDate: new Date('2025-11-04'),
        cast: ['Ranbir Kapoor', 'Alia Bhatt', 'Deepika Padukone', 'Ranveer Singh'],
        director: 'Ayan Mukerji',
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=V5Zzboaz33o',
        ageRating: 'UA',
        averageRating: 4.5,
        totalRatings: 840,
        movieStatus: 'coming_soon'
      }
    ];

    console.log(`[Seeder] Inserting ${moviesData.length} movies into collection...`);
    const createdMovies = await Movie.insertMany(moviesData);

    // 3. Seed Theaters, Screens & Physical Seats
    const theaterData = [
      {
        name: 'PVR INOX Icon — Phoenix Palladium',
        address: '462, Senapati Bapat Marg, Lower Parel',
        city: 'Mumbai',
        facilities: ['IMAX Laser', 'Dolby Atmos', 'Insignia Dining', 'Valet Parking', 'Recliner Seats'],
        contactPhone: '+91 22 4333 9999'
      },
      {
        name: 'Cinepolis — Viviana Mall',
        address: 'Eastern Express Highway, Thane West',
        city: 'Mumbai',
        facilities: ['4DX', 'Macro XE', 'Dolby 7.1', 'Food Court'],
        contactPhone: '+91 22 6170 1234'
      },
      {
        name: 'PVR Director’s Cut — Ambience Mall',
        address: 'Nelson Mandela Road, Vasant Kunj',
        city: 'Delhi-NCR',
        facilities: ['Ultra Luxe Recliners', 'Chef Curated Menu', 'Dolby Atmos', 'Concierge'],
        contactPhone: '+91 11 4087 0000'
      },
      {
        name: 'PVR IMAX — Vega City Mall',
        address: 'Bannerghatta Main Road, Dollars Colony',
        city: 'Bengaluru',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Gold Class Lounge'],
        contactPhone: '+91 80 6790 5555'
      },
      {
        name: 'Prasad Multiplex & IMAX',
        address: 'NTR Gardens, Khairatabad',
        city: 'Hyderabad',
        facilities: ['Giant Screen', 'Dolby Atmos', '4K Projection', 'Gaming Arcade'],
        contactPhone: '+91 40 2344 8888'
      }
    ];

    const rowConfigs = [
      { rowLabel: 'A', category: 'Silver', count: 10 },
      { rowLabel: 'B', category: 'Silver', count: 10 },
      { rowLabel: 'C', category: 'Gold', count: 12 },
      { rowLabel: 'D', category: 'Gold', count: 12 },
      { rowLabel: 'E', category: 'Gold', count: 12 },
      { rowLabel: 'F', category: 'Gold', count: 12 },
      { rowLabel: 'G', category: 'Premium', count: 8 },
      { rowLabel: 'H', category: 'Premium', count: 8 }
    ];

    const seatLayoutRows = rowConfigs.map((r) => ({
      rowLabel: r.rowLabel,
      category: r.category,
      seats: Array.from({ length: r.count }, (_, i) => ({
        number: i + 1,
        isAisle: i === 2 || i === r.count - 3,
        isActive: true
      }))
    }));

    const totalSeatsCount = rowConfigs.reduce((acc, curr) => acc + curr.count, 0); // 84 seats
    const allScreens = [];
    const allSeats = [];

    for (const tInfo of theaterData) {
      const theater = await Theater.create(tInfo);

      const screenConfigs = [
        { name: 'Screen 1 - IMAX Laser', type: 'IMAX 2D' },
        { name: 'Screen 2 - Dolby Atmos', type: 'Standard 2D' }
      ];

      for (const sConf of screenConfigs) {
        const screen = await Screen.create({
          theaterId: theater._id,
          name: sConf.name,
          screenType: sConf.type,
          totalSeats: totalSeatsCount,
          seatLayout: seatLayoutRows,
          seatCategories: [
            { name: 'Silver', basePrice: 190, rows: ['A', 'B'] },
            { name: 'Gold', basePrice: 290, rows: ['C', 'D', 'E', 'F'] },
            { name: 'Premium', basePrice: 450, rows: ['G', 'H'] }
          ]
        });

        allScreens.push({ screen, theater });

        // Generate physical Seat docs for Screen
        for (const row of rowConfigs) {
          for (let num = 1; num <= row.count; num++) {
            allSeats.push({
              screenId: screen._id,
              rowLabel: row.rowLabel,
              seatNumber: num,
              category: row.category,
              activeStatus: true
            });
          }
        }
      }
    }

    console.log(`[Seeder] Inserting ${allSeats.length} physical seats for ${allScreens.length} screens...`);
    await Seat.insertMany(allSeats);

    // 4. Seed Shows
    console.log('[Seeder] Generating showtimes for now_showing movies...');
    const nowShowingMovies = createdMovies.filter((m) => m.movieStatus === 'now_showing');
    const showSlotHours = [10, 13, 16, 19, 22]; // 10 AM, 1 PM, 4 PM, 7 PM, 10 PM
    const daysToSchedule = 3;
    const allShows = [];

    for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      for (let mIdx = 0; mIdx < nowShowingMovies.length; mIdx++) {
        const movie = nowShowingMovies[mIdx];
        const screenIndex = mIdx % allScreens.length;
        const { screen, theater } = allScreens[screenIndex];

        // 2 slots per movie per day
        const slotHour1 = showSlotHours[mIdx % showSlotHours.length];
        const slotHour2 = showSlotHours[(mIdx + 2) % showSlotHours.length];

        for (const hour of [slotHour1, slotHour2]) {
          const startTime = new Date(targetDate);
          startTime.setHours(hour, 30, 0, 0);

          const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);

          allShows.push({
            movieId: movie._id,
            theaterId: theater._id,
            screenId: screen._id,
            startTime,
            endTime,
            seatPricing: {
              Silver: 190,
              Gold: 290,
              Premium: 450
            },
            showStatus: 'scheduled'
          });
        }
      }
    }

    console.log(`[Seeder] Inserting ${allShows.length} scheduled shows...`);
    await Show.insertMany(allShows);

    // 5. Seed Reviews
    console.log('[Seeder] Adding authentic audience reviews...');
    const sampleReviewTexts = [
      { rating: 5, comment: 'An absolute cinematic masterpiece! Visuals and background score gave goosebumps.' },
      { rating: 5, comment: 'Phenomenal direction and powerful performances. A must-watch on IMAX laser!' },
      { rating: 4, comment: 'Brilliant entertainment with outstanding pacing. Highly recommended for cinema lovers.' }
    ];

    const reviewsToInsert = [];
    for (let i = 0; i < Math.min(8, createdMovies.length); i++) {
      const movie = createdMovies[i];
      const rev = sampleReviewTexts[i % sampleReviewTexts.length];
      reviewsToInsert.push({
        movieId: movie._id,
        userId: demoUser._id,
        rating: rev.rating,
        comment: rev.comment,
        moderationStatus: 'approved'
      });
    }

    await Review.insertMany(reviewsToInsert);

    console.log(`\n======================================================`);
    console.log(`✅ [Seeder] Database Seed Complete!`);
    console.log(`🎬 Movies:   ${createdMovies.length} titles`);
    console.log(`🏢 Theaters: ${theaterData.length} multiplexes`);
    console.log(`🖥️ Screens:  ${allScreens.length} screens`);
    console.log(`🪑 Seats:    ${allSeats.length} physical seats`);
    console.log(`🎟️ Shows:    ${allShows.length} showtimes`);
    console.log(`👤 Users:    Admin (admin@imovies.com / Admin@12345), Demo (demo@imovies.com / User@12345)`);
    console.log(`======================================================\n`);

    return {
      success: true,
      moviesCount: createdMovies.length,
      theatersCount: theaterData.length,
      screensCount: allScreens.length,
      showsCount: allShows.length
    };
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    throw error;
  }
};
