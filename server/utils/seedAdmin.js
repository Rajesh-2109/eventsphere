import 'dotenv/config';import mongoose from 'mongoose';import bcrypt from 'bcryptjs';import User from '../models/User.js';
await mongoose.connect(process.env.MONGO_URI);const email=(process.env.ADMIN_EMAIL||'').toLowerCase(),password=process.env.ADMIN_PASSWORD||'';
if(!email||password.length<12)throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in .env');
if(await User.exists({email}))console.log('Admin already exists; unchanged.');else{await User.create({name:process.env.ADMIN_NAME||'Admin',email,password:await bcrypt.hash(password,10),role:'admin'});console.log(`Admin created: ${email}`);}await mongoose.disconnect();
