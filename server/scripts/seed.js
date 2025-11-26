import mongoose from 'mongoose'
import { User } from '../models/User'
import { Category } from '../models/Category'
import { Tag } from '../models/Tag'
import { Menu } from '../models/Menu'
import { MenuItem } from '../models/MenuItem'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt4-cms'

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: 'nuxt4-cms',
    })
    console.log('✅ Connected to MongoDB')

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({})
    await Category.deleteMany({})
    await Tag.deleteMany({})
    await Menu.deleteMany({})
    await MenuItem.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@nuxt4cms.com',
      password: 'Admin@123456',
      name: 'Admin User',
      role: 'admin',
      bio: 'System Administrator'
    })
    console.log('👤 Created admin user:', adminUser.email)

    // Create sample categories
    const techCategory = await Category.create({
      name: 'Technology',
      slug: 'technology',
      description: 'Technology and programming articles',
      metaTitle: 'Technology Articles',
      metaDescription: 'Latest technology and programming articles'
    })

    const designCategory = await Category.create({
      name: 'Design',
      slug: 'design',
      description: 'UI/UX and graphic design articles',
      metaTitle: 'Design Articles',
      metaDescription: 'UI/UX and graphic design resources'
    })

    const webDevSubCategory = await Category.create({
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web development tutorials and guides',
      parent: techCategory._id
    })

    console.log('📁 Created sample categories')

    // Create sample tags
    const tags = await Tag.create([
      { name: 'Vue.js', slug: 'vuejs', color: '#42b883' },
      { name: 'Nuxt', slug: 'nuxt', color: '#00DC82' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
      { name: 'MongoDB', slug: 'mongodb', color: '#47A248' },
      { name: 'UI/UX', slug: 'ui-ux', color: '#FF6B6B' }
    ])
    console.log('🏷️  Created sample tags')

    // Create header menu
    const headerMenu = await Menu.create({
      name: 'Main Navigation',
      slug: 'main-navigation',
      position: 'header',
      isActive: true,
      sortOrder: 0
    })

    // Create header menu items
    await MenuItem.create([
      {
        menu: headerMenu._id,
        label: 'Home',
        linkType: 'url',
        url: '/',
        sortOrder: 0,
        isVisible: true
      },
      {
        menu: headerMenu._id,
        label: 'Posts',
        linkType: 'url',
        url: '/posts',
        sortOrder: 1,
        isVisible: true
      },
      {
        menu: headerMenu._id,
        label: 'Technology',
        linkType: 'category',
        category: techCategory._id,
        sortOrder: 2,
        isVisible: true
      },
      {
        menu: headerMenu._id,
        label: 'Design',
        linkType: 'category',
        category: designCategory._id,
        sortOrder: 3,
        isVisible: true
      }
    ])

    // Create footer menu
    const footerMenu = await Menu.create({
      name: 'Footer Links',
      slug: 'footer-links',
      position: 'footer',
      isActive: true,
      sortOrder: 0
    })

    await MenuItem.create([
      {
        menu: footerMenu._id,
        label: 'About',
        linkType: 'url',
        url: '/about',
        sortOrder: 0,
        isVisible: true
      },
      {
        menu: footerMenu._id,
        label: 'Contact',
        linkType: 'url',
        url: '/contact',
        sortOrder: 1,
        isVisible: true
      },
      {
        menu: footerMenu._id,
        label: 'Privacy Policy',
        linkType: 'url',
        url: '/privacy',
        sortOrder: 2,
        isVisible: true
      }
    ])

    console.log('📋 Created sample menus and menu items')

    console.log('\n✨ Seeding completed successfully!')
    console.log('\n📝 Admin Credentials:')
    console.log('   Email: admin@nuxt4cms.com')
    console.log('   Password: Admin@123456')
    console.log('\n⚠️  Please change the admin password after first login!')

  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
    process.exit(0)
  }
}

// Run seeder
seed()
