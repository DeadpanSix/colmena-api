const prisma = require('../config/database');

const DUE_SOON_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

async function getSummary() {
  const totalDocuments = await prisma.document.count();

  const statusCounts = await prisma.document.groupBy({
    by: ['status'],
    _count: true,
  });

  const byStatus = {
    RECEIVED: 0,
    IN_ROUTING: 0,
    PENDING_RESPONSE: 0,
    RESPONDED: 0,
    CANCELLED: 0,
  };

  statusCounts.forEach((row) => {
    byStatus[row.status] = row._count;
  });

  const originCounts = await prisma.document.groupBy({
    by: ['originDepartmentId'],
    _count: true,
  });

  const departments = await prisma.department.findMany({
    where: { id: { in: originCounts.map((row) => row.originDepartmentId) } },
  });

  const byOriginDepartment = originCounts.map((row) => {
    const department = departments.find((d) => d.id === row.originDepartmentId);
    return {
      departmentId: row.originDepartmentId,
      departmentName: department?.name || 'Unknown',
      count: row._count,
    };
  });

  const pendingSteps = await prisma.routingStep.findMany({
    where: { status: 'PENDING' },
    select: { deadline: true },
  });

  const now = new Date();
  let overdueSteps = 0;
  let dueSoonSteps = 0;

  pendingSteps.forEach((step) => {
    const timeUntilDeadline = step.deadline.getTime() - now.getTime();
    if (timeUntilDeadline < 0) {
      overdueSteps += 1;
    } else if (timeUntilDeadline <= DUE_SOON_THRESHOLD_MS) {
      dueSoonSteps += 1;
    }
  });

  return {
    totalDocuments,
    byStatus,
    byOriginDepartment,
    overdueSteps,
    dueSoonSteps,
  };
}

async function getTeamDashboard(teamId) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  const steps = await prisma.routingStep.findMany({
    where: { teamId },
    include: {
      document: {
        select: { id: true, folio: true, title: true, status: true },
      },
    },
    orderBy: { deadline: 'asc' },
  });

  const now = new Date();

  let pendingSteps = 0;
  let completedSteps = 0;
  let overdueSteps = 0;
  let dueSoonSteps = 0;

  const documents = steps.map((step) => {
    const isPending = step.status === 'PENDING';
    const timeUntilDeadline = step.deadline.getTime() - now.getTime();
    const isOverdue = isPending && timeUntilDeadline < 0;
    const isDueSoon = isPending && !isOverdue && timeUntilDeadline <= DUE_SOON_THRESHOLD_MS;

    if (isPending) pendingSteps += 1;
    if (step.status === 'COMPLETED') completedSteps += 1;
    if (isOverdue) overdueSteps += 1;
    if (isDueSoon) dueSoonSteps += 1;

    return {
      documentId: step.document.id,
      folio: step.document.folio,
      title: step.document.title,
      documentStatus: step.document.status,
      stepOrder: step.order,
      stepStatus: step.status,
      deadline: step.deadline,
      isOverdue,
      isDueSoon,
    };
  });

  return {
    teamId: team.id,
    teamName: team.name,
    pendingSteps,
    completedSteps,
    overdueSteps,
    dueSoonSteps,
    documents,
  };
}

module.exports = { getSummary, getTeamDashboard };
