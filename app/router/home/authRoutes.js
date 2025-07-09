const express = require('express');
const routeLabel = require('route-label');
const AuthController=require('../../modules/home/controller/AuthController');
// const {authCheck,authorizeRoles}=require('../../middleware/auth');


const router = express.Router();

const namedRouter = routeLabel(router);


namedRouter.get('recruiter-register-page','/auth/register-recruiter',AuthController.getRecruiterRegisterPage);
namedRouter.post('recruiter-register','/auth/register-recruiter',AuthController.registerRecruiter);
namedRouter.get('candidate-register-page','/auth/register-candidate',AuthController.getCandidateRegisterPage);
namedRouter.post('candidate-register','/auth/register-candidate',AuthController.registerCandidate);


namedRouter.get('login-page','/auth/login',AuthController.getLoginPage);
// namedRouter.post('login','/auth/login',AuthController.login);
namedRouter.post('candidate-login','/auth/login/candidate',AuthController.loginCandidate);
namedRouter.post('recruiter-login','/auth/login/recruiter',AuthController.loginRecruiter);


namedRouter.get('verify-email','/auth/verify-email/:token',AuthController.verifyEmail);
namedRouter.get('auth-message','/auth/message',AuthController.authMessagePage);

namedRouter.get('logout','/auth/logout',AuthController.logout);


module.exports = router;