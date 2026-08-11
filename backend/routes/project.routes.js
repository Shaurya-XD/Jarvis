import { createProjectController, getAllProjects, addUserToProjectController, getProjectByIdController, updateTree } from "../controllers/project.controller.js";
import { body } from "express-validator";
import { authUser } from "../middleware/auth.middleware.js";
import { Router } from "express";
const router = Router();

router.post('/create',
    body('name').isString().notEmpty().withMessage('Name is required'),
    authUser, createProjectController);

router.get('/all', authUser, getAllProjects);

router.put('/add-user',
    body('projectId').isString().withMessage('Project ID is require'),
    body('users').isArray({min: 1})
        .withMessage('Users must be an array of strings')
        .bail()
        .custom((users) =>  users.every(user => typeof user === 'string'))
        .withMessage('Each user must be a string'),
    authUser, addUserToProjectController)

router.get('/get-project/:projectId', authUser, getProjectByIdController)

router.put('/update-file-tree', authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    updateTree
)

export default router;