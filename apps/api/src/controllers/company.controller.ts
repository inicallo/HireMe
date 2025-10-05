import prisma from '#/prisma';
import { $Enums, Prisma } from '@prisma/client';
import { Request, Response } from 'express';

export class CompanyController {
  async createCompany(req: Request, res: Response) {
    try {
      const {
        company_name, email, phone, aboutUs, website, linkedin, instagram,
        twitter, facebook, yearOfEstablish, IndustryType, TeamSize,
        country, address, description, logoUrl, bannerUrl,
      } = req.body;

      const userId = req.user?.user_id;

      if (!company_name || !email || !userId) {
        return res.status(400).json({ status: 'error', msg: 'Company name, email, and user ID are required' });
      }

      const companyData: Prisma.CompanyCreateInput = {
        company_name,
        email,
        phone,
        aboutUs,
        website,
        linkedin,
        instagram,
        twitter,
        facebook,
        yearOfEstablish,
        ...(IndustryType && { IndustryType }),
        ...(TeamSize && { TeamSize }),
        country,
        address,
        description,
        logo: logoUrl,
        banner: bannerUrl,
        users: { connect: { user_id: userId } },
      };

      const company = await prisma.company.create({ data: companyData });

      res.status(201).json({ status: 'ok', msg: 'Company created successfully!', company });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ status: 'error', msg: 'An error occurred while creating the company.', error: error.message });
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const {
        company_name, email, phone, aboutUs, website, linkedin, instagram,
        twitter, facebook, yearOfEstablish, IndustryType, TeamSize,
        country, address, description, logoUrl, bannerUrl,
      } = req.body;

      // ✅ FIX: Build the data object conditionally to avoid invalid enum values
      const dataToUpdate: Prisma.CompanyUpdateInput = {
        company_name,
        email,
        phone,
        aboutUs,
        website,
        linkedin,
        instagram,
        twitter,
        facebook,
        yearOfEstablish,
        country,
        address,
        description,
        ...(logoUrl && { logo: logoUrl }),
        ...(bannerUrl && { banner: bannerUrl }),
      };

      // Only add these fields if they are not empty strings
      if (IndustryType) {
        dataToUpdate.IndustryType = IndustryType;
      }
      if (TeamSize) {
        dataToUpdate.TeamSize = TeamSize;
      }

      const updatedCompany = await prisma.company.update({
        where: { company_id: req.params.id },
        data: dataToUpdate,
      });

      res.status(200).json({ status: 'ok', msg: 'Company updated successfully!', company: updatedCompany });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ status: 'error', msg: 'An error occurred while updating company information', error: error.message });
    }
  }

  async getAllCompanies(req: Request, res: Response) {
    try {
      const companies = await prisma.company.findMany();
      res.status(200).json({ status: 'ok', companies });
    } catch (err) {
      res.status(400).json({ status: 'error', msg: 'An error occurred while fetching companies.' });
    }
  }

  async getCompanies(req: Request, res: Response) {
    try {
      const { search, IndustryType, country, TeamSize, dateRange } = req.query;
      const filter: Prisma.CompanyWhereInput = {};

      if (typeof search === 'string') {
        const lowerSearch = search.toLowerCase();
        filter.OR = [
          { company_name: { contains: lowerSearch, mode: 'insensitive' } },
          { address: { contains: lowerSearch, mode: 'insensitive' } },
          { aboutUs: { contains: lowerSearch, mode: 'insensitive' } },
          { description: { contains: lowerSearch, mode: 'insensitive' } },
        ];
      }
      if (IndustryType) {
        const industryArray = Array.isArray(IndustryType) ? IndustryType : [IndustryType];
        filter.IndustryType = { in: industryArray as $Enums.IndustryType[] };
      }
      if (country) filter.country = country as $Enums.CountryCode;
      if (TeamSize) filter.TeamSize = { equals: TeamSize as string };

      const orderBy: Prisma.CompanyOrderByWithRelationInput = {
        created_at: dateRange === 'latest' ? 'desc' : 'asc',
      };

      const companies = await prisma.company.findMany({ where: filter, orderBy });
      res.status(200).json({ status: 'ok', companies });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to fetch companies' });
    }
  }

  async getCompanyById(req: Request, res: Response) {
    try {
      const companyId = req.params.id;
      const company = await prisma.company.findUnique({
        where: { company_id: companyId },
        include: { jobs: true },
      });

      if (!company) return res.status(404).json({ status: 'error', msg: 'Company not found.' });
      res.status(200).json({ status: 'ok', company });
    } catch (err) {
      res.status(400).json({ status: 'error', msg: 'An error occurred while fetching the company.' });
    }
  }

  async deleteCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.id;
      await prisma.company.delete({ where: { company_id: companyId } });
      res.status(200).json({ status: 'ok', msg: 'Company deleted successfully!' });
    } catch (err) {
      res.status(400).json({ status: 'error', msg: 'An error occurred while deleting the company.' });
    }
  }

  async getUserCompany(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(400).json({ status: 'error', msg: 'User ID not found. Please log in.' });

      const company = await prisma.company.findFirst({
        where: { users: { some: { user_id: userId } } },
        include: { users: true },
      });

      if (!company) return res.status(404).json({ status: 'error', msg: 'No company found for the authenticated user.' });
      res.status(200).json({ status: 'ok', company });
    } catch (err) {
      res.status(500).json({ status: 'error', msg: 'An error occurred while fetching company information.' });
    }
  }
}