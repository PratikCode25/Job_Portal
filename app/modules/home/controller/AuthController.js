const Joi = require('joi');
const authRepositories = require('../repositories/authRepositories');
const { recruiterRegisterSchema } = require('../../recruiter/validation/recruiterRegisterValidation');
const { comparePassword } = require('../../../helper/password');
const jwt = require('jsonwebtoken');
const transporter = require('../../../config/emailConfig');
const companyRepositories = require('../../company/repositories/companyRepositories');

class AuthController {
    async getRecruiterRegisterPage(req, res) {
        try {
            return res.render('auth/register-recruiter');
        } catch (error) {
            console.log(error);
        }
    }

    async registerRecruiter(req, res) {
        try {

            const { error, value } = recruiterRegisterSchema.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name, email, designation, company, password, isNewCompany, companyId, website } = value;



            const existingUser = await authRepositories.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    status: false,
                    errors: { email: 'Email is already registered.' }
                });
            }

            if (isNewCompany) {
                const existingCompanyByName = await companyRepositories.checkCompanyExistByName(company)
                if (existingCompanyByName) {
                    return res.status(400).json({
                        status: false,
                        errors: { company: 'A company with this name already exists. Please select it from the suggestions or use a different name.' }
                    });
                }
            } else {
                const existCompany = await companyRepositories.getCompanyById(companyId);
                if (!existCompany) {
                    return res.status(404).json({
                        status: false,
                        message: 'The selected company is not found. Check again or contact support for query.'
                    })
                }
                if (!existCompany.isActive) {
                    return res.status(400).json({
                        status: false,
                        message: 'The company is not yet approved or has been deactivated. Contact support for query.'
                    })
                }

            }

            const user = await authRepositories.createRecruiter({
                name,
                email,
                password,
                designation,
                company,
                isNewCompany,
                companyId,
                website
            });

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

            const url = `${req.protocol}://${req.get('host')}` + `/auth/verify-email/${token}`

            console.log(url);
            //             await transporter.sendMail({
            //                 from: process.env.EMAIL_FROM,
            //                 to: newUser.email,
            //                 subject: "Testing Node.js Project- Verify your email",
            //                 html: `<p>
            //   <a href="${url}" style="
            //     display: inline-block;
            //     padding: 10px 20px;
            //     background-color: #007bff;
            //     color: #ffffff;
            //     text-decoration: none;
            //     border-radius: 5px;
            //     font-weight: bold;
            //   ">
            //     Verify Your Email
            //   </a>`
            //             })

            return res.status(201).json({
                status: true,
                message: 'Recruiter registered successfully.Please verify your email and login.',
                url
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getCandidateRegisterPage(req, res) {
        try {
            return res.render('auth/register-candidate');
        } catch (error) {
            console.log(error);

        }
    }

    async registerCandidate(req, res) {
        try {
            const candidateRegisterSchema = Joi.object({
                name: Joi.string().trim().required().messages({
                    'any.required': 'Name is required',
                    'string.empty': 'Name is required',
                }),
                email: Joi.string().email().required().messages({
                    'any.required': 'Email is required',
                    'string.empty': 'Email is required',
                    'string.email': 'Invalid email format',
                }),
                password: Joi.string().min(6).required().messages({
                    'any.required': 'Password is required',
                    'string.empty': 'Password is required',
                    'string.min': 'Password must be at least 6 characters',
                }),
            });

            const { error, value } = candidateRegisterSchema.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name, email, password } = value;

            const existingUser = await authRepositories.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    status: false,
                    errors: { email: 'Email is already registered.' }
                });
            }

            const user = await authRepositories.createCandidate(value);

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

            const url = `${req.protocol}://${req.get('host')}` + `/auth/verify-email/${token}`

            console.log(url);
            //             await transporter.sendMail({
            //                 from: process.env.EMAIL_FROM,
            //                 to: newUser.email,
            //                 subject: "Testing Node.js Project- Verify your email",
            //                 html: `<p>
            //   <a href="${url}" style="
            //     display: inline-block;
            //     padding: 10px 20px;
            //     background-color: #007bff;
            //     color: #ffffff;
            //     text-decoration: none;
            //     border-radius: 5px;
            //     font-weight: bold;
            //   ">
            //     Verify Your Email
            //   </a>`
            //             })

            return res.status(201).json({
                status: true,
                message: 'Registered successfully.Please verify your email and login.',
                url
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }


    async getLoginPage(req, res) {
        try {
            return res.render('auth/login');
        } catch (error) {
            console.log(error);
        }
    }

    // async login(req, res) {
    //     try {
    //         const { email, password } = req.body;
    //         if (!email || !password) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Email and password are required.'
    //             });
    //         }
    //         const user = await authRepositories.findUserByEmail(email);
    //         if (!user) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Invalid email or password.'
    //             })
    //         }
    //         if (!user.isVerified) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Please verify your email.'
    //             })
    //         }

    //         if (user.isRemoved) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Your profile has been close.Please contact for query.'
    //             })
    //         }

    //         if (user.role === 'recruiter') {
    //             if (user.recruiterProfile.approvalStatus === 'pending') {
    //                 return res.status(400).json({
    //                     status: false,
    //                     message: 'Your company has not approved your recruiter profile.'
    //                 })
    //             }

    //             if(!user.recruiterProfile.isActive){
    //                 return res.status(400).json({
    //                     status: false,
    //                     message: 'Your recruiter profile has been deactivated'
    //                 })
    //             }
    //         }

    //         const isMatch = await comparePassword(password, user.password);
    //         if (!isMatch) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Invalid email or password.'
    //             })
    //         }

    //         const payload = {
    //             _id: user._id,
    //             username: user.name,
    //             role: user.role,
    //             profilePicture: user.profilePicture
    //         }

    //         if (user.role === 'recruiter') {
    //             payload.companyId = user.company;
    //             payload.recruiterRole = user.recruiterProfile?.companyRole || 'basic_recruiter';
    //         }

    //         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
    //         res.cookie('token', token, { httpOnly: true, maxAge: 3600000 * 3 });

    //         res.status(200).json({
    //             status: true,
    //             message: 'Logged in successfully.',
    //             role: user.role
    //         })

    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({
    //             status: false,
    //             message: 'Something went wrong. Please try again later.'
    //         });
    //     }
    // }


    async loginCandidate(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'Email and password are required.'
                });
            }
            const user = await authRepositories.findCandidateOrAdminByEmail(email);
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }
            if (!user.isVerified) {
                return res.status(400).json({
                    status: false,
                    message: 'Please verify your email.'
                })
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }

            if (!user.isActive || user.isRemoved) {
                return res.status(400).json({
                    status: false,
                    message: 'Your account is not active.Please contact support for query.'
                })
            }


            const payload = {
                _id: user._id,
                username: user.name,
                role: user.role,
                profilePicture: user.profilePicture
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 * 3 });

            res.status(200).json({
                status: true,
                message: 'Logged in successfully.',
                role: user.role
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async loginRecruiter(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'Email and password are required.'
                });
            }
            const user = await authRepositories.findRecruiterByEmail(email);
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }
            if (!user.isVerified) {
                return res.status(400).json({
                    status: false,
                    message: 'Please verify your email.'
                })
            }

            // if (user.isRemoved) {
            //     return res.status(400).json({
            //         status: false,
            //         message: 'Your profile has been close.Please contact for query.'
            //     })
            // }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid email or password.'
                })
            }

            if (user.recruiterProfile.approvalStatus === 'pending') {
                return res.status(400).json({
                    status: false,
                    message: 'Your company has not approved your recruiter profile.'
                })
            }

            if (!user.recruiterProfile.isActive) {
                return res.status(400).json({
                    status: false,
                    message: 'Your recruiter profile has been deactivated'
                })
            }

            const payload = {
                _id: user._id,
                username: user.name,
                role: user.role,
                profilePicture: user.profilePicture,
                companyId: user.company,
                recruiterRole: user.recruiterProfile?.companyRole || 'basic_recruiter'
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 * 3 });

            res.status(200).json({
                status: true,
                message: 'Logged in successfully.',
                role: user.role
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async verifyEmail(req, res) {
        try {
            const token = req.params.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await authRepositories.getUserById(decoded.userId);

            if (!user) {
                return res.redirect('/auth/message?status=error&message=Invalid or expired token.');
            }

            if (user.isVerified) {
                return res.redirect('/auth/message?status=info&message=Your email is already verified.');
            }

            await authRepositories.emailverifyUser(decoded.userId);

            return res.redirect('/auth/message?status=success&message=Your email has been verified successfully.');
        } catch (error) {
            console.error(error);

            if (error.name === 'TokenExpiredError') {
                const decoded = jwt.decode(req.params.token);
                if (decoded && decoded.userId) {
                    const user = await authRepositories.getUserById(decoded.userId);
                    if (user && !user.isVerified) {
                        const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
                        const url = `${req.protocol}://${req.get('host')}/auth/verify-email/${newToken}`;

                        console.log(url);
                        // await transporter.sendMail({
                        //     from: process.env.EMAIL_FROM,
                        //     to: user.email,
                        //     subject: 'Resend: Verify Your Email',
                        //     html: `
                        //       <p>Your previous verification link expired.</p>
                        //       <p>
                        //         <a href="${url}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
                        //           Verify Email
                        //         </a>
                        //       </p>`
                        // });

                        return res.redirect('/auth/message?status=info&message=Verification link expired. A new one has been sent to your email.');
                    }
                }
            }

            return res.redirect('/auth/message?status=error&message=Something went wrong during email verification.');
        }
    }

    async authMessagePage(req, res) {
        try {
            const { status, message } = req.query;
            res.render('auth/auth-message', { status, message })
        } catch (error) {
            console.log(error);
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('token');
            return res.redirect('/auth/login');
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = new AuthController();