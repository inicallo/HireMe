import prisma from '@/prisma';
import { Request, Response } from 'express';
import { compare, genSalt, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { transporter } from '@/helpers/notmailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

export const base_url = process.env.BASE_API_URL;
export const base_fe_url = process.env.BASE_FE_URL;

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        role,
        company_name,
        company_email,
        country,
      } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ status: 'error', msg: 'Email already in use!' });
      }

      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      // This transaction block ensures both operations succeed or fail together
      const createdData = await prisma.$transaction(async (prismaTransaction) => {
        const newUser = await prismaTransaction.user.create({
          data: {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role,
            is_verified: false,
          },
        });

        let newCompany = null;
        if (role === 'admin' && company_name && company_email) {
          newCompany = await prismaTransaction.company.create({
            data: {
              company_name,
              email: company_email,
              country,
              users: { connect: { user_id: newUser.user_id } },
            },
          });
        }

        return { newUser, newCompany };
      });

      const { newUser } = createdData;

      const payload = { user_id: newUser.user_id };
      const token = sign(payload, process.env.SECRET_JWT!, {
        expiresIn: '60m',
      });

      const templatePath = path.join(
        __dirname,
        '../templates',
        'verification.hbs',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateSource);
      const emailHtml = compiledTemplate({
        name: newUser.first_name + ' ' + newUser.last_name,
        link: `${base_fe_url}/verify/${token}`,
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: newUser.email,
        subject: 'Verify Your HireMe Account',
        html: emailHtml,
      });

      res.status(201).json({
        status: 'ok',
        msg: 'Account created successfully! Please verify your email!',
        ...createdData,
      });
    } catch (err) {
      const error = err as Error
      res.status(400).json({
        status: 'error',
        msg: error.message || 'An error occurred during user registration.',
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!existingUser) throw new Error('Account not found!');
      if (!existingUser.is_verified) throw new Error('Account not verified!');

      const isValidPass = await compare(password, existingUser.password);

      if (!isValidPass) throw new Error('Incorrect password!');

      const payload = {
        user_id: existingUser.user_id,
        role: existingUser.role,
      };
      const token = sign(payload, process.env.SECRET_JWT!, { expiresIn: '1d' });

      res.status(200).send({
        status: 'ok',
        msg: 'Login success!',
        token,
        user: existingUser,
      });
    } catch (err) {
      res.status(400).send({
        status: 'error',
        msg: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const user = await prisma.user.findMany({
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          profile_picture: true,
          role: true,
        },
      });
      res.status(200).send({
        status: 'ok',
        msg: 'Accounts fetched!',
        user,
      });
    } catch (err) {
      const error = err as Error;
      res.status(400).send({
        status: 'error',
        msg: error.message,
      });
    }
  }

  async getUserId(req: Request, res: Response) {
    try {
      const userId = req.params.id; // ID is a string from params

      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).send({
          status: 'error',
          msg: 'Account not found!',
        });
      }

      res.status(200).send({
        status: 'ok',
        msg: 'Account fetched!',
        user,
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).send({
        status: 'error',
        msg: 'Internal server error',
        error: error.message,
      });
    }
  }

  async verifyUser(req: Request, res: Response) {
    try {
      const token =
        typeof req.query.token === 'string'
          ? req.query.token
          : req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(400).send({
          status: 'error',
          msg: 'Token is missing',
        });
      }

      const decoded = verify(token, process.env.SECRET_JWT!) as { user_id: string };
      const userId = decoded.user_id;

      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).send({
          status: 'error',
          msg: 'User not found.',
        });
      }

      if (user.is_verified) {
        return res.status(400).send({
          status: 'error',
          msg: 'User is already verified.',
        });
      }

      await prisma.user.update({
        where: { user_id: userId },
        data: { is_verified: true },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Account successfully verified!',
      });
    } catch (err) {
      res.status(400).send({
        status: 'error',
        msg: 'Invalid or expired verification token',
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const {
        first_name, last_name, phone, email, currentPassword, Newpassword, Confirmpassword,
        website, linkedin, github, twitter, facebook, instagram, title, education, biography,
        location, skills, languages, nationality, gender, country, tempat_lahir,
        DateOfBirth, years_of_experience, fileUrl
      } = req.body;

      const profilePictureUrl = fileUrl;

      const userId = req.user?.user_id;
      if (!userId) throw new Error('Account not authenticated');

      const user = await prisma.user.findUnique({ where: { user_id: userId } });
      if (!user) throw new Error('Account not found');

      let hashedPassword;
      if (Newpassword) {
        if (!currentPassword) {
          return res.status(400).send({ status: 'error', msg: 'Current password is required to update the password.' });
        }
        const isPasswordValid = await compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).send({ status: 'error', msg: 'Current password is incorrect.' });
        }
        if (Newpassword !== Confirmpassword) {
          return res.status(400).send({ status: 'error', msg: 'New password and confirmation password do not match.' });
        }
        hashedPassword = await hash(Newpassword, await genSalt(10));
      }

      const updateData: any = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (phone) updateData.phone = phone;
      if (email) {
        updateData.email = email;
        updateData.is_verified = false;
      }
      if (website) updateData.website = website;
      if (title) updateData.title = title;
      if (education) updateData.education = education;
      if (biography) updateData.biography = biography;
      if (location) updateData.location = location;
      if (skills) updateData.skills = skills;
      if (languages) updateData.languages = languages;
      if (nationality) updateData.nationality = nationality;
      if (gender) updateData.gender = gender;
      if (DateOfBirth) updateData.DateOfBirth = new Date(DateOfBirth);
      if (years_of_experience) {
        updateData.years_of_experience = parseInt(String(years_of_experience), 10);
      }
      if (profilePictureUrl) updateData.profile_picture = profilePictureUrl;
      if (hashedPassword) updateData.password = hashedPassword;
      // Add other fields from body if they exist
      if (linkedin) updateData.linkedin = linkedin;
      if (github) updateData.github = github;
      if (twitter) updateData.twitter = twitter;
      if (facebook) updateData.facebook = facebook;
      if (instagram) updateData.instagram = instagram;
      if (country) updateData.country = country;
      if (tempat_lahir) updateData.tempat_lahir = tempat_lahir;

      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
        data: updateData,
      });

      if (email && email !== user.email) {
        const payload = { user_id: updatedUser.user_id };
        const token = sign(payload, process.env.SECRET_JWT!, { expiresIn: '60m' });
        const templatePath = path.join(__dirname, '../templates', 'reVerification.hbs');
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(templateSource);
        const emailHtml = compiledTemplate({
          name: updatedUser.first_name + ' ' + updatedUser.last_name,
          link: `${base_fe_url}/verify/${token}`,
        });
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: updatedUser.email,
          subject: 'Verify Your HireMe Account',
          html: emailHtml,
        });
      }

      res.status(200).send({
        status: 'ok',
        msg: 'Account information updated successfully!',
        user: updatedUser,
      });
    } catch (err) {
      res.status(400).send({
        status: 'error',
        msg: 'An error occurred while updating user information',
      });
    }
  }

  async resendVerificationLink(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ status: 'error', msg: 'User not found!' });
      if (user.is_verified) return res.status(400).json({ status: 'error', msg: 'User is already verified.' });

      const payload = { user_id: user.user_id };
      const token = sign(payload, process.env.SECRET_JWT!, { expiresIn: '60m' });
      const templatePath = path.join(__dirname, '../templates', 'verification.hbs');
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateSource);
      const emailHtml = compiledTemplate({
        name: user.first_name + ' ' + user.last_name,
        link: `${base_fe_url}/verify/${token}`,
      });
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'Resend Verification - Verify Your HireMe Account',
        html: emailHtml,
      });

      res.status(200).json({ status: 'ok', msg: 'Verification link resent successfully!' });
    } catch (err) {
      res.status(500).json({ status: 'error', msg: 'An error occurred while resending verification link.' });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ status: 'error', msg: 'User not found!' });
      if (!user.password || user.password.trim() === '') {
        return res.status(400).json({ status: 'error', msg: 'Social login detected. Password reset not available.' });
      }

      const payload = { user_id: user.user_id };
      const resetToken = sign(payload, process.env.SECRET_JWT!, { expiresIn: '15m' });
      const resetLink = `${base_fe_url}/reset-password?token=${resetToken}`;
      const templatePath = path.join(__dirname, '../templates', 'resetPassword.hbs');
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateSource);
      const emailHtml = compiledTemplate({
        name: user.first_name + ' ' + user.last_name,
        link: resetLink,
      });
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: emailHtml,
      });

      res.status(200).json({ status: 'ok', msg: 'Password reset link sent!' });
    } catch (err) {
      res.status(500).json({ status: 'error', msg: 'An error occurred during password reset request.' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmNewPassword } = req.body;
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ status: 'error', msg: 'Passwords do not match' });
      }

      const decoded = verify(token, process.env.SECRET_JWT!) as { user_id: string };
      const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
      if (!user) return res.status(404).json({ status: 'error', msg: 'User not found!' });

      const salt = await genSalt(10);
      const hashedPassword = await hash(newPassword, salt);

      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { password: hashedPassword },
      });

      res.status(200).json({ status: 'ok', msg: 'Password has been reset successfully!' });
    } catch (err) {
      res.status(400).json({ status: 'error', msg: 'Invalid or expired token' });
    }
  }

  async socialLogin(req: Request, res: Response) {
    const { email, first_name, last_name, profile_picture } = req.body;
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            first_name,
            last_name,
            profile_picture,
            is_verified: true,
            password: '',
            role: 'candidate',
          },
        });
      }

      const payload = { user_id: user.user_id, role: user.role };
      const token = sign(payload, process.env.SECRET_JWT!, { expiresIn: '1d' });

      res.status(200).json({ status: 'ok', msg: 'Social login successful', token, user });
    } catch (error) {
      res.status(500).json({ status: 'error', msg: 'Internal server error during social login' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ status: 'error', msg: 'User not found!' });
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) return res.status(400).json({ status: 'error', msg: 'Incorrect password provided!' });

      await prisma.user.delete({ where: { user_id: user.user_id } });

      res.status(200).json({ status: 'ok', msg: 'Account deleted successfully!' });
    } catch (err) {
      res.status(500).json({ status: 'error', msg: 'Failed to delete account. Please try again.' });
    }
  }

  async getTotalUserSubscribe(req: Request, res: Response) {
    try {
      const userCount = await prisma.user.count({ where: { is_verified: true } });
      res.status(200).json({ status: 'ok', userCount });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to fetch total user subscribe count' });
    }
  }

  async getUserSubscriptions(req: Request, res: Response) {
    const user_id = req.user?.user_id;
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { user_id },
        include: { subscriptionType: true },
      });
      res.status(200).json({ status: 'success', data: subscriptions });
    } catch (error: any) {
      res.status(500).json({ status: 'error', msg: 'Failed to fetch subscriptions', error: error.message });
    }
  }

  async getUserPayments(req: Request, res: Response) {
    const user_id = req.user?.user_id;
    try {
      const payments = await prisma.paymentTransaction.findMany({ where: { user_id } });
      res.status(200).json({ status: 'success', data: payments });
    } catch (error: any) {
      res.status(500).json({ status: 'error', msg: 'Failed to fetch payments', error: error.message });
    }
  }
}