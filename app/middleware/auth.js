const jwt = require('jsonwebtoken');
const companyModel = require('../modules/company/model/companyModel');

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    if (req.xhr) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.userInfo = req.user;
    return next();
  } catch (err) {
    if (req.xhr) {
      return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }
    return res.redirect('/auth/login');
  }
}

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.redirect('/auth/login');

    }
    return next();
  };
};

// const checkCompanyCreator = async (req, res, next) => {
//   try {
//     const user = req.user;
//     res.locals.isCompanyAdmin = false;
//     if (user && user.role === 'recruiter' && user.companyId) {
//       const company = await companyModel.findById(user.companyId);
//       if (company && user._id.toString() === company.createdBy.toString()) {
//         res.locals.isCompanyAdmin = true
//         // console.log('hello',true);
//       }
//     }
//     return next();
//   } catch (error) {
//     console.log(error);
//   }
// }

const checkRecruiterAccess = async (req, res, next) => {
  try {
    const user = req.user;

    res.locals.isCompanyAdmin = false;
    res.locals.companyIsActive = false;

    if (user && user.role === 'recruiter' && user.companyId) {
      const company = await companyModel.findById(user.companyId).lean();

      if (company) {
        res.locals.companyIsActive = company.isActive;
        if (user.recruiterRole === 'admin_recruiter') {
          res.locals.isCompanyAdmin = true;
        }
      }
    }

    // console.log(res.locals.isCompanyAdmin, res.locals.companyIsActive);

    return next();

  } catch (error) {
    console.log('Error in checkRecruiterAccess middleware:', error);
    return res.redirect('/auth/login');
  }
}

const onlyAdminRecruiter = (req, res, next) => {
  const user = req.user;

  const isAdminRecruiter =
    user?.role === 'recruiter' &&
    user?.recruiterRole === 'admin_recruiter';

  if (isAdminRecruiter) {
    return next();
  }

  const errorMessage = 'Access denied. Admin recruiter permission required.';

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(403).json({
      status: false,
      message: errorMessage
    });
  } else {
    req.flash('error', errorMessage);
    return res.redirect('/recruiter/dashboard');
  }
};

const companyMustBeActive = (req, res, next) => {
  if (!res.locals.companyIsActive) {
    const errorMessage = 'Your company is not active. Please contact support.';

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({ status: false, message: errorMessage });
    } else {
      req.flash('error', errorMessage);
      return res.redirect('/recruiter/dashboard');
    }
  }

  return next();
};



module.exports = { authenticate, authorizeRoles, checkRecruiterAccess, onlyAdminRecruiter };

