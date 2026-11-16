import Notification from '../models/Notification.js';
export async function notify(io,userId,p){const n=await Notification.create({user:userId,...p});io?.to(`user:${userId}`).emit('notification:new',{id:n._id,type:n.type,message:n.message,link:n.link,createdAt:n.createdAt});return n;}
export async function notifyMany(io,ids,p){await Promise.all([...new Set(ids.map(String))].map(id=>notify(io,id,p)));}
