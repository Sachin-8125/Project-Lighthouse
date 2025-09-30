/**
 * A simplified risk analysis service.
 * In a real-world scenario, this would involve more complex models,
 * possibly machine learning, and a wider range of data points.
 */

const calculateRiskScore = (student) => {
    if (!student || !student.submissions || student.submissions.length === 0) {
        return {
            score: 0,
            summary: "No submission data available to calculate risk.",
            factors: []
        };
    }

    let totalScore = 0;
    const factors = [];
    const submissions = student.submissions;

    // Factor 1: Average Grade
    const gradedSubmissions = submissions.filter(s => s.grade !== null);
    if (gradedSubmissions.length > 0) {
        const totalGrade = gradedSubmissions.reduce((acc, s) => acc + (s.grade / s.assignment.maxScore), 0);
        const averageGradePercentage = (totalGrade / gradedSubmissions.length) * 100;

        if (averageGradePercentage < 60) {
            totalScore += 0.4;
            factors.push({ name: "Low Average Grade", value: `${averageGradePercentage.toFixed(1)}%`, impact: 0.4 });
        } else if (averageGradePercentage < 75) {
            totalScore += 0.2;
            factors.push({ name: "Concerning Average Grade", value: `${averageGradePercentage.toFixed(1)}%`, impact: 0.2 });
        }
    }

    // Factor 2: Submission Lateness
    const lateSubmissions = submissions.filter(s => {
        const dueDate = new Date(s.assignment.dueDate);
        const submittedAt = new Date(s.submittedAt);
        return submittedAt > dueDate;
    });

    if (lateSubmissions.length > 0) {
        const latePercentage = lateSubmissions.length / submissions.length;
        if (latePercentage > 0.5) {
            totalScore += 0.4;
            factors.push({ name: "High Rate of Late Submissions", value: `${(latePercentage * 100).toFixed(0)}%`, impact: 0.4 });
        } else if (latePercentage > 0.2) {
            totalScore += 0.2;
            factors.push({ name: "Some Late Submissions", value: `${(latePercentage * 100).toFixed(0)}%`, impact: 0.2 });
        }
    }

    // Factor 3: Declining Performance Trend
    if (gradedSubmissions.length >= 2) {
        const sortedByDate = gradedSubmissions.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
        const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
        const secondHalf = sortedByDate.slice(Math.ceil(sortedByDate.length / 2));
        
        const avgFirstHalf = firstHalf.reduce((acc, s) => acc + (s.grade / s.assignment.maxScore), 0) / firstHalf.length;
        const avgSecondHalf = secondHalf.reduce((acc, s) => acc + (s.grade / s.assignment.maxScore), 0) / secondHalf.length;

        if (avgSecondHalf < avgFirstHalf * 0.8) { // More than 20% drop
            totalScore += 0.3;
            factors.push({ name: "Declining Performance Trend", value: `From ${(avgFirstHalf*100).toFixed(0)}% to ${(avgSecondHalf*100).toFixed(0)}%`, impact: 0.3 });
        }
    }

    // Normalize score to be between 0 and 1
    const finalScore = Math.min(totalScore, 1);

    let summary = "Student appears to be performing well.";
    if (finalScore >= 0.7) {
        summary = "Student is at high risk. Immediate attention recommended.";
    } else if (finalScore >= 0.4) {
        summary = "Student is showing signs of potential risk. Monitoring is advised.";
    }


    return {
        score: parseFloat(finalScore.toFixed(2)),
        summary,
        factors
    };
};

module.exports = {
    calculateRiskScore,
};
