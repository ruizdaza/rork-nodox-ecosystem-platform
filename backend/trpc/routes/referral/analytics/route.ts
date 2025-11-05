import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ReferralStats, ReferralAnalytics } from "@/types/referral";
import { referralLeads } from "../leads/route";
import { commissions } from "../commissions/route";
import { campaigns } from "../campaigns/route";

export const getReferralStatsProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const referrerId = input.referrerId || ctx.user.id;
    const userLeads = referralLeads.filter((l) => l.referrerId === referrerId);
    const userCommissions = commissions.filter((c) => c.referrerId === referrerId);
    const userCampaigns = campaigns.filter((c) => c.referrerId === referrerId);

    const totalLeads = userLeads.length;
    const activeLeads = userLeads.filter(
      (l) => l.status === "lead" || l.status === "contacted" || l.status === "qualified"
    ).length;
    const convertedLeads = userLeads.filter((l) => l.status === "converted").length;
    const lostLeads = userLeads.filter((l) => l.status === "lost").length;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const convertedWithDates = userLeads.filter(
      (l) => l.status === "converted" && l.conversionDate
    );
    const avgConversionTime =
      convertedWithDates.length > 0
        ? convertedWithDates.reduce((sum, l) => {
            const joinTime = new Date(l.joinDate).getTime();
            const convTime = new Date(l.conversionDate!).getTime();
            return sum + (convTime - joinTime) / (1000 * 60 * 60 * 24);
          }, 0) / convertedWithDates.length
        : 0;

    const totalCommissionsEarned = userCommissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommissions = userCommissions
      .filter((c) => c.status === "pending" || c.status === "approved")
      .reduce((sum, c) => sum + c.amount, 0);
    const paidCommissions = userCommissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);

    const totalLifetimeValue = userLeads.reduce((sum, l) => sum + l.lifetimeValue, 0);
    const averageLifetimeValue = totalLeads > 0 ? totalLifetimeValue / totalLeads : 0;

    const sourceCounts = userLeads.reduce(
      (acc, l) => {
        acc[l.source] = (acc[l.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const topPerformingSource =
      Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "direct_link";

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const leadsThisMonth = userLeads.filter((l) => new Date(l.joinDate) >= monthStart).length;
    const leadsThisWeek = userLeads.filter((l) => new Date(l.joinDate) >= weekStart).length;
    const leadsToday = userLeads.filter((l) => new Date(l.joinDate) >= dayStart).length;

    const conversionsThisMonth = userLeads.filter(
      (l) => l.status === "converted" && l.conversionDate && new Date(l.conversionDate) >= monthStart
    ).length;

    const revenueThisMonth = userCommissions
      .filter((c) => new Date(c.earnedDate) >= monthStart)
      .reduce((sum, c) => sum + c.amount, 0);

    const lastMonthLeads = userLeads.filter((l) => {
      const joinDate = new Date(l.joinDate);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return joinDate >= lastMonth && joinDate < thisMonth;
    }).length;

    const monthlyGrowth =
      lastMonthLeads > 0 ? ((leadsThisMonth - lastMonthLeads) / lastMonthLeads) * 100 : 0;

    const activeCampaigns = userCampaigns.filter((c) => c.status === "active").length;

    const totalCampaignSpent = userCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalCampaignRevenue = userCampaigns.reduce(
      (sum, c) => sum + c.metrics.revenue,
      0
    );
    const campaignROI =
      totalCampaignSpent > 0 ? ((totalCampaignRevenue - totalCampaignSpent) / totalCampaignSpent) * 100 : 0;

    const stats: ReferralStats = {
      totalLeads,
      activeLeads,
      convertedLeads,
      lostLeads,
      conversionRate,
      averageConversionTime: Math.round(avgConversionTime),
      totalCommissionsEarned,
      pendingCommissions,
      paidCommissions,
      totalLifetimeValue,
      averageLifetimeValue,
      topPerformingSource,
      monthlyGrowth,
      leadsThisMonth,
      conversionsThisMonth,
      revenueThisMonth,
      leadsThisWeek,
      leadsToday,
      activeCampaigns,
      campaignROI,
    };

    return stats;
  });

export const getReferralAnalyticsProcedure = protectedProcedure
  .input(
    z.object({
      referrerId: z.string().optional(),
      period: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const referrerId = input.referrerId || ctx.user.id;
    const userLeads = referralLeads.filter((l) => l.referrerId === referrerId);
    const userCommissions = commissions.filter((c) => c.referrerId === referrerId);

    const now = new Date();
    let startDate: Date;
    let endDate = input.endDate ? new Date(input.endDate) : now;

    if (input.startDate) {
      startDate = new Date(input.startDate);
    } else {
      switch (input.period) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
    }

    const filteredLeads = userLeads.filter((l) => {
      const joinDate = new Date(l.joinDate);
      return joinDate >= startDate && joinDate <= endDate;
    });

    const filteredConversions = filteredLeads.filter((l) => l.status === "converted");

    const filteredCommissions = userCommissions.filter((c) => {
      const earnedDate = new Date(c.earnedDate);
      return earnedDate >= startDate && earnedDate <= endDate;
    });

    const totalRevenue = filteredCommissions.reduce((sum, c) => sum + c.amount, 0);

    const metrics = {
      leads: {
        value: filteredLeads.length,
        change: 0,
      },
      conversions: {
        value: filteredConversions.length,
        change: 0,
      },
      revenue: {
        value: totalRevenue,
        change: 0,
      },
      commissions: {
        value: totalRevenue,
        change: 0,
      },
      avgConversionTime: {
        value: 0,
        change: 0,
      },
      conversionRate: {
        value: filteredLeads.length > 0 ? (filteredConversions.length / filteredLeads.length) * 100 : 0,
        change: 0,
      },
    };

    const chartData: any[] = [];
    const sourceBreakdown: any[] = [];

    const sourceCounts = filteredLeads.reduce(
      (acc, l) => {
        if (!acc[l.source]) {
          acc[l.source] = { leads: 0, conversions: 0, revenue: 0 };
        }
        acc[l.source].leads += 1;
        if (l.status === "converted") {
          acc[l.source].conversions += 1;
          acc[l.source].revenue += l.lifetimeValue;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    Object.entries(sourceCounts).forEach(([source, data]) => {
      sourceBreakdown.push({
        source,
        ...data,
        conversionRate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0,
      });
    });

    const topLeads = filteredLeads
      .filter((l) => l.status === "converted")
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 10);

    const analytics: ReferralAnalytics = {
      period: input.period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metrics,
      chartData,
      sourceBreakdown,
      topLeads,
      recentActivity: [],
    };

    return analytics;
  });
