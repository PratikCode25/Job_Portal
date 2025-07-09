const companyRepositories = require("../repositories/companyRepositories");
const Joi = require('joi');
const { companyValidationSchema } = require("../validation/companyValidationSchema");
const fs = require('fs').promises;

class CompanyController {
    async searchComanyByName(req, res) {
        try {
            const search = req.query.name;
            console.log(search);
            if (!search) {
                return res.status(200).json([])
            }
            const comapnies = await companyRepositories.findCompanyByname(search);
            // console.log(comapnies);
            return res.status(200).json(comapnies);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later'
            })
        }
    }

    async getCompanyPage(req, res) {
        try {
            const companyId = req.user.companyId;
            const company = await companyRepositories.getCompanyById(companyId);

            return res.render('recruiter/manage-company', { title: 'Manage Company', company });
        } catch (error) {
            console.log(error);
        }
    }

    async updateCompany(req, res) {
        try {
            const id = req.params.id;

            const { error, value } = companyValidationSchema.validate(req.body, { abortEarly: false });
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

            const { name, email, website, description } = value;

            // const existingComapnyName=await companyRepositories.findCompanyByname(name);
            // if(existingComapnyName){
            //      return res.status(400).json({
            //         status: false,
            //         errors: { name: 'This company name is already registered' }
            //     });
            // }

            const company = await companyRepositories.getCompanyById(id);

            // let logo = req.file ? req.file.path : company.logo;
            let logo = req.file
                ? `uploads/companyLogo/${req.file.filename}`
                : company.logo;

            const updatedCompany = await companyRepositories.updateCompany(id, { ...value, logo })
            if (!updatedCompany) {
                return res.status(400).json({
                    status: false,
                    message: 'Company is not found.'
                })
            }

            if (req.file && company.logo) {
                try {
                    await fs.access(company.logo)
                    await fs.unlink(company.logo);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.error('Error deleting old image:', error);
                    }
                }

            }

            return res.status(200).json({
                status: true,
                message: "Company details has been updated successfully.",
                data: updatedCompany
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getManageCompaniesPageByAdmin(req, res) {
        try {
            return res.render('admin/manage-companies', { title: 'Manage Company' })
        } catch (error) {
            console.log(error);
        }
    }

    async getCompaniesPaginated(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
            }

            const { companies, totalCount, totalPages } = await companyRepositories.getAllCompanies(options);

            return res.status(200).json({
                status: true,
                message: 'Companies has been fetched successfully',
                data: companies,
                totalRecords: totalCount,
                page: parseInt(page),
                totalPages: totalPages
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async activateCompany(req, res) {
        try {
            const companyId = req.params.id;

            const company = await companyRepositories.getCompanyById(companyId);

            if (!company) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            if (company.isActive) {
                return res.status(400).json({
                    status: false,
                    message: 'Company is already active'
                })
            }

            const updatedCompany = await companyRepositories.activateCompany(companyId);

            return res.status(200).json({
                status: true,
                message: `${company.name} is activated successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deactivateCompany(req, res) {
        try {
            const companyId = req.params.id;

            const company = await companyRepositories.getCompanyById(companyId);

            if (!company) {
                return res.status(404).json({
                    status: false,
                    message: 'Company is not found'
                })
            }

            if (company.isActive === false) {
                return res.status(400).json({
                    status: false,
                    message: 'Company is already deactive'
                })
            }

            const updatedCompany = await companyRepositories.deactivateCompany(companyId);

            return res.status(200).json({
                status: true,
                message: `${company.name} is deactivated successfully`
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

}

module.exports = new CompanyController();