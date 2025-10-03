import prisma from '@/prisma';
import { NotificationType } from '@prisma/client';
import { transporter } from '@/helpers/notmailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { getFriendlyStatus } from '@/utils/applicationStatusMapper';
import { base_fe_url } from '@/controllers/user.controller';

export async function sendNotification({
  userId,
  subject,
  message,
  type,
  relatedId,
  link,
}: {
  userId: number;
  subject: string;
  message: string;
  type: NotificationType;
  relatedId?: number;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      user_id: userId,
      subject,
      message,
      is_read: false,
      type,
      related_id: relatedId,
      link,
    },
  });
}

export async function notifyApplicationStatusChange(
  userId: number,
  applicationId: number,
  currentStatus: string,
  newStatus: string
) {
  const application = await prisma.application.findUnique({
    where: { application_id: applicationId },
    include: {
      job: { include: { company: true } },
      user: true,
    },
  });

  if (!application || !application.user?.email) return;

  const { job, user } = application;
  const jobTitle = job?.job_title || 'the position';
  const companyName = job?.company?.company_name || 'the company';

  const friendlyCurrentStatus = getFriendlyStatus(currentStatus);
  const friendlyNewStatus = getFriendlyStatus(newStatus);

  await sendNotification({
    userId,
    subject: 'Application Status Update',
    message: `Your application for ${jobTitle} at ${companyName} has changed from ${friendlyCurrentStatus} to ${friendlyNewStatus}.`,
    type: NotificationType.application,
    relatedId: applicationId,
    link: `/applications/${applicationId}`,
  });

  const templatePath = path.join(process.cwd(), 'src/templates/applicationStatusUpdate.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const compiledTemplate = handlebars.compile(templateSource);

  const emailHtml = compiledTemplate({
    name: `${user.first_name} ${user.last_name}`,
    jobTitle,
    companyName,
    currentStatus: friendlyCurrentStatus,
    newStatus: friendlyNewStatus,
    loginLink: `${base_fe_url}/sign-in`,
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: 'Application Status Update',
    html: emailHtml,
  });
}

export async function sendApplicationStatusNotification(
  userId: number,
  applicationId: number,
  status: string
) {
  const application = await prisma.application.findUnique({
    where: { application_id: applicationId },
    include: {
      job: { include: { company: true } },
      user: true,
    },
  });

  if (!application || !application.user?.email) return;

  const { job, user } = application;
  const jobTitle = job?.job_title || 'the position';
  const companyName = job?.company?.company_name || 'the company';

  const friendlyStatus = getFriendlyStatus(status);

  await sendNotification({
    userId,
    subject: 'Application Status Update',
    message: `Your application for ${jobTitle} at ${companyName} has been updated to ${friendlyStatus}.`,
    type: NotificationType.application,
    relatedId: applicationId,
    link: `/applications/${applicationId}`,
  });

  const templatePath = path.join(__dirname, '../templates/applicationStatusUpdate.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const compiledTemplate = handlebars.compile(templateSource);

  const emailHtml = compiledTemplate({
    name: `${user.first_name} ${user.last_name}`,
    jobTitle,
    companyName,
    newStatus: friendlyStatus,
    loginLink: `${base_fe_url}/sign-in`,
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: 'Application Status Update',
    html: emailHtml,
  });
}

export async function createInterviewNotification(
  interviewId: number,
  userId: number,
  status: string
) {
  const interview = await prisma.interview.findUnique({
    where: { interview_id: interviewId },
    include: {
      application: {
        include: { job: { include: { company: true } }, user: true },
      },
    },
  });

  if (!interview || !interview.application?.user?.email) return;

  const { application } = interview;
  const jobTitle = application.job?.job_title || 'the position';
  const companyName = application.job?.company?.company_name || 'the company';
  const user = application.user;

  const friendlyInterviewStatus = getFriendlyStatus(status);

  await sendNotification({
    userId,
    subject: 'Interview Update',
    message: `Your interview for ${jobTitle} at ${companyName} is now ${friendlyInterviewStatus}.`,
    type: NotificationType.interview,
    relatedId: interviewId,
    link: `/interviews/${interviewId}`,
  });

  const templatePath = path.join(__dirname, '../templates/interviewStatusUpdate.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const compiledTemplate = handlebars.compile(templateSource);

  const emailHtml = compiledTemplate({
    name: `${user.first_name} ${user.last_name}`,
    jobTitle,
    companyName,
    interviewStatus: friendlyInterviewStatus,
    loginLink: `${base_fe_url}/sign-in`,
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: user.email,
    subject: 'Interview Status Update',
    html: emailHtml,
  });
}
