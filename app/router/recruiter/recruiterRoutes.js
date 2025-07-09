const express = require('express');
const routeLabel = require('route-label');
const RecruiterController = require('../../modules/recruiter/controller/RecruiterController');
const { authenticate,authorizeRoles,checkRecruiterAccess,onlyAdminRecruiter } = require('../../middleware/auth');
const createImageUploader  = require('../../helper/imageUpload');
const logoUpload = createImageUploader('companyLogo');
const userImageUpload=createImageUploader('user');

const CompanyController = require('../../modules/company/controller/CompanyController');
const JobController = require('../../modules/job/controller/JobController');
const ApplicationController = require('../../modules/application/controller/ApplicationController');
const CandidateController = require('../../modules/candidate/controller/CandidateController');

const router = express.Router();

const namedRouter = routeLabel(router);

namedRouter.get('recruiter-home-page','/recruiter/dashboard',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,RecruiterController.dashboard);
namedRouter.get('recruiter-profile','/recruiter/profile',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,RecruiterController.getRecruiterProfile);
namedRouter.put('update-recruiter-profile','/recruiter/update-profile',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,userImageUpload.single('profilePicture'),RecruiterController.updateRecruiterProfile);



// -- company --
namedRouter.get('recruiter-manage-company-page','/recruiter/manage-company',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,onlyAdminRecruiter,CompanyController.getCompanyPage);
namedRouter.post('recruiter-company-update','/recruiter/company/:id/update',authenticate,authorizeRoles('recruiter'),onlyAdminRecruiter,logoUpload.single('logo'),CompanyController.updateCompany);

// -- recruiter --
namedRouter.get('manage-recruiter-page','/recruiter/manage-recruiter',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,onlyAdminRecruiter,RecruiterController.manageRecruiterPage);
namedRouter.put('approve-recruiter','/recruiter/:id/approve',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,onlyAdminRecruiter,RecruiterController.approveRecruiter);
namedRouter.put('deactivate-recruiter','/recruiter/:id/deactivate',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,onlyAdminRecruiter,RecruiterController.deactivateRecruiter);
namedRouter.put('activate-recruiter','/recruiter/:id/activate',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,onlyAdminRecruiter,RecruiterController.activateRecruiter);
namedRouter.put('reject-recruiter','/recruiter/:id/reject',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,onlyAdminRecruiter,RecruiterController.rejectRecruiter);

// --- jobs ----
namedRouter.get('recruiter-post-job-page','/recruiter/jobs/add',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.getAddJoPage);
namedRouter.post('recruiter-post-job','/recruiter/jobs/add',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.createJob);
namedRouter.get('recruiter-manage-job-page','/recruiter/jobs/list',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.manageJobPage);
namedRouter.get('recruiter-posted-jobs','/recruiter/jobs/by-recruiter/pagination',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.getJobsPaginated);
namedRouter.get('recruiter-edit-job','/recruiter/jobs/:id',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.getEditJobPage);
namedRouter.post('recruiter-update-job','/recruiter/jobs/:id/update',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.updateJob);
namedRouter.put('recruiter-delete-job','/recruiter/jobs/:id/delete',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.deleteJob);
namedRouter.put('recruiter-status-update-job','/recruiter/jobs/:id/status-update',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.updateJobStatus);
namedRouter.get('recruiter-detail-info-job','/recruiter/jobs/:id/detail-information',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,JobController.getDetailJobInformation);

// -- applications --
namedRouter.get('recruiter-job-application','/recruiter/jobs/:id/applicationspage',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,ApplicationController.getApplicationsPageByJob);
namedRouter.get('recruiter-get-application-detail','/recruiter/applications/:id/details',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,ApplicationController.getApplicationDetails);
namedRouter.get('recruiter-get-applications','/recruiter/applications/:jobId',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,ApplicationController.getApplicationsPaginationByJobId);

// -- profile --
namedRouter.get('recruiter-get-candidate-profile','/recruiter/candidate/:id',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,CandidateController.getRecruiterViewOfCandidateProfile);
namedRouter.post('recruiter-accept-appliation','/recruiter/applications/:id/accept',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,ApplicationController.acceptApplication);
namedRouter.post('recruiter-reject-appliation','/recruiter/applications/:id/reject',authenticate,authorizeRoles('recruiter'),checkRecruiterAccess,ApplicationController.rejectApplication);




module.exports = router;