import Project from "../models/project.models.js";
import { createProject, getAllProjectsByUserId, addUsersToProject, getProjectById } from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProjectController = async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()[0].msg});
    }

    try{
        const {name} = req.body;
        const userId = req.user._id;

        const project = await createProject({name, userId});

        return res.status(201).json({message: 'Project Created Successfully', project});
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const getAllProjects = async(req, res) =>{
    try{
        const userId = req.user._id
        const projects = await getAllProjectsByUserId({userId})

        return res.status(200).json({projects});
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const addUserToProjectController = async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()[0].msg});
    }

    try{
        const {projectId, users} = req.body;
        const userId = req.user._id;
        const project = await addUsersToProject({projectId, users, userId})
        res.status(200).json({project})

    }catch(err){
        res.status(400).json({error: err.message});
    }

}

export const getProjectByIdController = async(req, res) => {
    const { projectId } = req.params;
    try{
        const project = await getProjectById({projectId});
        res.status(200).json({project})
    }catch(err){
        res.status(400).json({error: err.message});
    }
}