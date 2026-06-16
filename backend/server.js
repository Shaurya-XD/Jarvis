import 'dotenv/config'; // since we are using "type": module i.e ESM
import { generateResponse } from './services/ai.service.js';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project from './models/project.models.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*'
	}
});

io.use(async(socket, next) => {
	try {
		const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];

		const projectId = socket.handshake.query.projectId;
		if(!mongoose.Types.ObjectId.isValid(projectId)){
			return next(new Error('Invalid projectId'))
		}

		socket.project = await Project.findById(projectId);

		if(!token){
			return next(new Error('Authentication error'));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if(!decoded){
			return next(new Error('Authentication error'))
		}
		socket.user = decoded;
		next();
		
	} catch (error) {
		next(error)
	}
})

io.on('connection', socket => {
	console.log("Connected",socket.user.email)
	socket.roomId = socket.project._id.toString();
	socket.join(socket.roomId);

	socket.on('project-message', async data => {
		console.log(data)
		const message = data.message;
		const isPrompt = message.startsWith('@ai');

		socket.broadcast.to(socket.roomId).emit('project-message', data);
		
		if(isPrompt){
			const prompt = message.replace('@ai', '')
			const response = await generateResponse(prompt);
			io.to(socket.roomId).emit('project-message', {
				message: response,
				email: 'AI',
				sender: 'gemini'
			})
		}
		
	})

	socket.broadcast.to(socket.roomId).emit('user-joined', {
		email: socket.user.email
	});

	socket.on('disconnect', () => {
		socket.broadcast.to(socket.roomId).emit('user-left', {
		email: socket.user.email
		});

		console.log("Disconnected", socket.user.email);
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
