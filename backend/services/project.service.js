import mongoose from "mongoose";
import Project from "../models/project.models.js";
import User from "../models/users.models.js";

export const createProject = async({name, userId}) => {
    if(!name || !userId){
        throw new Error('All fields are required');
    }

    const existingProject = await Project.findOne({name});
    if(existingProject){
        throw new Error('Project already exists')
    }

    const project = await Project.create({name, users:[userId]});

    return project;
}

export const getAllProjectsByUserId = async({userId}) => {
    if(!userId){
        throw new Error('UserId is required');
    }

    const projects = await Project.find({
        users: userId
    });

    return projects;
}

export const addUsersToProject = async({projectId, users, userId}) => {
    if(!users || !projectId || !userId){
        throw new Error('All fields are required');
    }

    const projectExists = await Project.findOne({_id: projectId, users: userId});
    if(!projectExists){
        throw new Error('Project does not exist');
    }

    const existingUsers = await User.find({
        _id: { $in: users }
    });

    if (existingUsers.length !== users.length) {
        throw new Error('One or more users do not exist');
    }

    const updatedProject = await Project.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject;
}

export const getProjectById = async({ projectId }) => {
    if(!projectId){
        throw new Error('ProjectId is required');
    }

    const project = await Project.findById(projectId).populate('users');
    return project;
}

export const updateFileTree = async({projectId, fileTree}) => {
    if(!projectId){
        throw new Error("projectId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId")
    }

    if(!fileTree){
        throw new Error("fileTree is required")
    }

    const project = await Project.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new:True
    })

    return project;
}