import Election from "../models/electionModel.js";
import Candidate from "../models/candidateModel.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";

// ─────────────────────────────────────────────
// 📦  ELECTION CRUD
// ─────────────────────────────────────────────

/** GET /api/elections/public - Fetch elections for registration */
export const getPublicElections = async (req, res) => {
    try {
        const elections = await Election.find({ status: { $in: ["upcoming", "active", "pending"] } })
            .select("title _id")
            .sort({ createdAt: -1 });
        res.json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** GET /api/elections */
export const getElections = async (req, res) => {
    try {
        const elections = await Election.find()
            .populate("candidates", "name email photo bio role targetYear targetDepartment voteCount")
            .sort({ createdAt: -1 });
        res.json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** GET /api/elections/:id */
export const getElectionById = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id).populate(
            "candidates",
            "name email photo bio role targetYear targetDepartment voteCount"
        );
        if (!election) return res.status(404).json({ message: "Election not found" });
        res.json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** POST /api/elections  (Admin only) */
export const createElection = async (req, res) => {
    try {
        const { title, description, startDate, endDate, type, targetYear, targetDepartment } = req.body;

        const election = await Election.create({
            title,
            description,
            startDate,
            endDate,
            type,
            targetYear,
            targetDepartment,
            
        });

        res.status(201).json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** PUT /api/elections/:id (Admin only) */
export const updateElection = async (req, res) => {
    try {
        const { title, description, startDate, endDate, type, targetYear, targetDepartment } = req.body;
        const election = await Election.findById(req.params.id);

        if (!election) return res.status(404).json({ message: "Election not found" });

        if (title) election.title = title;
        if (description) election.description = description;
        if (startDate) election.startDate = startDate;
        if (endDate) election.endDate = endDate;
        if (type) election.type = type;
        if (targetYear) election.targetYear = targetYear;
        if (targetDepartment) election.targetDepartment = targetDepartment;

        await election.save();
        res.json(election);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** PUT /api/elections/:id/start  (Admin only) */
export const startElection = async (req, res) => {
    console.log(`[ELECTION_START] Triggered for ID: ${req.params.id}`);
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: "Election not found" });

        election.status = "active";
        await election.save();
        console.log(`[ELECTION_START_SUCCESS] "${election.title}" is now active.`);
        res.json({ message: "Election started", election });
    } catch (err) {
        console.error(`[ELECTION_START_ERROR]`, err);
        res.status(500).json({ message: err.message });
    }
};

/** PUT /api/elections/:id/stop  (Admin only) */
export const stopElection = async (req, res) => {
    console.log(`\n[ELECTION_STOP_TRIGGER] Starting completion process for Election ID: ${req.params.id}`);
    try {
        const election = await Election.findById(req.params.id).populate(
            "candidates",
            "name email voteCount"
        );
        if (!election) {
            console.error(`[ELECTION_STOP_ERROR] Election ${req.params.id} not found in database.`);
            return res.status(404).json({ message: "Election not found" });
        }

        console.log(`[ELECTION_PROGRESS] Election "${election.title}" found. Setting status to "completed".`);
        election.status = "completed";
        await election.save();

        // 📊 Calculate Results for Email
        console.log(`[ELECTION_PROGRESS] Tallying results for ${election.candidates.length} candidates...`);
        const sortedResults = [...election.candidates].sort((a, b) => b.voteCount - a.voteCount);
        const totalVotes = sortedResults.reduce((sum, c) => sum + c.voteCount, 0);
        const winner = sortedResults.length > 0 && totalVotes > 0 ? sortedResults[0] : null;
        
        console.log(`[ELECTION_RESULTS] Total Votes: ${totalVotes} | Winner: ${winner ? winner.name : 'None'}`);

        // 📧 Map through candidates to send results
        console.log(`[EMAIL_DISPATCH] Preparing to send results to ${election.candidates.length} candidates...`);
        const emailPromises = election.candidates.map(async (candidate) => {
            const rank = sortedResults.findIndex(c => c._id.toString() === candidate._id.toString()) + 1;
            const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;

            console.log(`[EMAIL_SENDING] Queuing email for: ${candidate.name} (${candidate.email}) | Rank: #${rank}`);

            const emailHtml = `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                
                <!-- Hero Header -->
                <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center; color: white;">
                  <div style="display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 30px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
                    Official Results
                  </div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${election.title}</h1>
                  <p style="margin: 10px 0 0; color: #94a3b8; font-size: 16px;">The voting window has closed.</p>
                </div>

                <!-- Status Banner -->
                <div style="background: #f8fafc; padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                  <span style="font-size: 14px; font-weight: 600; color: #64748b;">
                    Total Participation: <span style="color: #1e293b;">${totalVotes.toLocaleString()} Votes</span>
                  </span>
                </div>

                <!-- Main Body -->
                <div style="padding: 40px;">
                  <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Final Tally Summary</h2>
                  <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
                    Dear <strong>${candidate.name}</strong>, the results for the <em>${election.title}</em> have been finalized. Below is a summary of the election outcome and your specific performance.
                  </p>

                  <!-- Personal Performance Box -->
                  <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px 0;">
                    <p style="margin: 0 0 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800;">Your Statistics</p>
                    <div style="display: flex; gap: 20px;">
                      <div style="flex: 1;">
                        <span style="display: block; font-size: 24px; font-weight: 800; color: #4f46e5;">#${rank}</span>
                        <span style="font-size: 12px; color: #94a3b8;">Final Rank</span>
                      </div>
                      <div style="flex: 1;">
                        <span style="display: block; font-size: 24px; font-weight: 800; color: #0f172a;">${candidate.voteCount}</span>
                        <span style="font-size: 12px; color: #94a3b8;">Total Votes</span>
                      </div>
                      <div style="flex: 1;">
                        <span style="display: block; font-size: 24px; font-weight: 800; color: #0f172a;">${percentage}%</span>
                        <span style="font-size: 12px; color: #94a3b8;">Vote Share</span>
                      </div>
                    </div>
                  </div>

                  <!-- Winner Declaration -->
                  ${winner ? `
                  <div style="border: 1px solid #dcfce7; background-color: #f0fdf4; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                    <div style="font-size: 24px;">🏆</div>
                    <div>
                      <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 700; text-transform: uppercase;">Elected Representative</p>
                      <h3 style="margin: 4px 0 0; color: #14532d; font-size: 18px; font-weight: 800;">${winner.name}</h3>

                    </div>
                  </div>
                  ` : ''}

                  <!-- Leaderboard Preview -->
                  <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 15px;">Standings</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                      <tr style="text-align: left; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 10px 0; color: #94a3b8;">Candidate</th>
                        <th style="padding: 10px 0; color: #94a3b8; text-align: right;">Votes</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sortedResults.slice(0, 5).map((c, idx) => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 12px 0; color: #334155;">
                            <span style="font-weight: 700; margin-right: 8px; color: ${idx === 0 ? '#f59e0b' : '#94a3b8'};">#${idx + 1}</span>
                            <strong>${c.name}</strong>
                          </td>
                          <td style="padding: 12px 0; text-align: right; color: #1e293b; font-weight: 600;">${c.voteCount}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>

                  <div style="text-align: center; margin-top: 40px;">
                    <a href="http://localhost:5173/candidate-login" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 700; font-size: 14px;">
                      View Full Results Portal
                    </a>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #1e293b; font-weight: 700; font-size: 14px;">VoteCentral Administration</p>
                  <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">This is a system-generated report for official record-keeping.</p>
                  <p style="margin: 15px 0 0; color: #cbd5e1; font-size: 11px;">© ${new Date().getFullYear()} VoteCentral Platform. Secure. Verified. Transparent.</p>
                </div>
              </div>
            `;

            try {
                const result = await sendEmail({
                    to: candidate.email,
                    subject: `📊 Official Results: ${election.title}`,
                    html: emailHtml,
                });
                console.log(`[EMAIL_SUCCESS] Sent to ${candidate.email}`);
                return result;
            } catch (err) {
                console.error(`[EMAIL_FAILURE] Failed to send to ${candidate.email}:`, err.message);
                throw err;
            }
        });

        await Promise.all(emailPromises);
        console.log(`[ELECTION_COMPLETE] All candidate emails dispatched for "${election.title}".\n`);

        res.json({ message: "Election completed and results sent to candidates", election });
    } catch (err) {
        console.error(`[ELECTION_STOP_CRITICAL_FAILURE]`, err);
        res.status(500).json({ message: err.message });
    }
};

/** GET /api/elections/:id/results  (Admin only) */
export const getElectionResults = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id).populate(
            "candidates",
            "name photo voteCount role targetYear targetDepartment"
        );
        if (!election) return res.status(404).json({ message: "Election not found" });

        // overall sorted for backward compatibility
        const sorted = [...election.candidates].sort(
            (a, b) => b.voteCount - a.voteCount
        );
        const totalVotes = sorted.reduce((sum, c) => sum + c.voteCount, 0);

        // Group by role
        const roles = ["Secretary", "Joint Secretary", "Additional Joint Secretary", "CR"];
        const resultsByRole = {};

        roles.forEach(role => {
            const roleCandidates = election.candidates.filter(c => c.role === role)
                .sort((a, b) => b.voteCount - a.voteCount);
            
            if (roleCandidates.length > 0) {
                if (role === "CR") {
                    // Further group CR by class
                    const crGroups = {};
                    roleCandidates.forEach(c => {
                        const classKey = `${c.targetYear} • ${c.targetDepartment}`;
                        if (!crGroups[classKey]) crGroups[classKey] = [];
                        crGroups[classKey].push(c);
                    });

                    // For each class, sort and calculate rank/percentage
                    resultsByRole[role] = Object.entries(crGroups).map(([className, candidates]) => {
                        const sortedCandidates = candidates.sort((a, b) => b.voteCount - a.voteCount);
                        const classTotalVotes = sortedCandidates.reduce((sum, c) => sum + c.voteCount, 0);
                        return {
                            className,
                            candidates: sortedCandidates.map((c, i) => ({
                                rank: i + 1,
                                _id: c._id,
                                name: c.name,
                                photo: c.photo,
                                voteCount: c.voteCount,
                                role: c.role,
                                percentage: classTotalVotes > 0 ? ((c.voteCount / classTotalVotes) * 100).toFixed(1) : 0,
                            }))
                        };
                    });
                } else {
                    const roleTotalVotes = roleCandidates.reduce((sum, c) => sum + c.voteCount, 0);
                    resultsByRole[role] = roleCandidates.map((c, i) => ({
                        rank: i + 1,
                        _id: c._id,
                        name: c.name,
                        photo: c.photo,
                        voteCount: c.voteCount,
                        role: c.role,
                        percentage: roleTotalVotes > 0 ? ((c.voteCount / roleTotalVotes) * 100).toFixed(1) : 0,
                    }));
                }
            }
        });


        res.json({
            election: {
                _id: election._id,
                title: election.title,
                status: election.status,
            },
            totalVotes,
            results: sorted.map((c, i) => ({
                rank: i + 1,
                _id: c._id,
                name: c.name,
                photo: c.photo,
                voteCount: c.voteCount,
                role: c.role,
                percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : 0,
            })),
            resultsByRole
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


/** DELETE /api/elections/:id  (Admin only) */
export const deleteElection = async (req, res) => {
    try {
        const id = req.params.id;
        const election = await Election.findByIdAndDelete(id);
        if (!election) return res.status(404).json({ message: "Election not found" });

        // 🗑️ Success! Now delete all associated candidates
        await Candidate.deleteMany({ election: id });

        res.json({ message: "Election and all associated candidates deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// 👥  CANDIDATE CRUD (Admin)
// ─────────────────────────────────────────────

/** POST /api/elections/:id/candidates  (Admin only) */
export const addCandidate = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: "Election not found" });

        const { name, email, password, bio, role, targetYear, targetDepartment } = req.body;

        // Hash password for candidate login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const photo = req.files?.photo
            ? req.files.photo[0].path
            : "";

        const candidate = await Candidate.create({
            name,
            email,
            password: hashedPassword,
            bio,
            photo,
            election: election._id,
            role,
            targetYear,
            targetDepartment,
            
        });

        election.candidates.push(candidate._id);
        await election.save();

        // 📧 Send professional credentials email to the candidate
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; letter-spacing: -0.5px;">VoteCentral</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Official Election Management System</p>
            </div>

            <!-- Badge -->
            <div style="background: #f1f5f9; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <span style="background: #7c3aed; color: white; font-size: 12px; font-weight: bold; padding: 4px 16px; border-radius: 99px; letter-spacing: 1px; text-transform: uppercase;">Candidate Registration Confirmation</span>
            </div>

            <!-- Body -->
            <div style="padding: 40px 40px 30px; background-color: #ffffff;">
              <h2 style="color: #1e293b; margin: 0 0 6px; font-size: 22px;">Welcome, ${name}!</h2>
              <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                You have been successfully registered as an official candidate for the <strong>${election.title}</strong> election on the VoteCentral platform.
              </p>

              <!-- Election Info Box -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
                <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: bold;">Election Details</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px;">Election</td>
                    <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${election.title}</td>
                  </tr>

                </table>
              </div>

              <!-- Credentials Box -->
              <div style="background: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 28px;">
                <p style="margin: 0 0 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: bold;">Your Login Credentials</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8; width: 120px;">Email</td>
                    <td style="padding: 8px 0; color: #e2e8f0; font-weight: 600; font-family: monospace;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Password</td>
                    <td style="padding: 8px 0; color: #e2e8f0; font-weight: 600; font-family: monospace;">${password}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
                Please keep your credentials safe. We recommend changing your password after your first login. You can access your dashboard using the button below.
              </p>

              <!-- CTA -->
              <div style="text-align: center;">
                <a href="http://localhost:5173/candidate-login"
                  style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px; letter-spacing: 0.5px;">
                  Access Candidate Dashboard
                </a>
              </div>
            </div>

            <!-- Security Notice -->
            <div style="background: #fefce8; border-top: 1px solid #fde68a; padding: 16px 40px;">
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                ⚠️ <strong>Security Notice:</strong> This email contains sensitive login information. Do not forward or share it. If you did not expect this email, please contact the election administration immediately.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} VoteCentral. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail({
            to: email,
            subject: `🗳️ Candidate Registration Confirmed — ${election.title}`,
            html: emailHtml,
        });

        res.status(201).json(candidate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** GET /api/elections/:id/candidates */
export const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({ election: req.params.id });
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** GET /api/elections/candidates/:id */
export const getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });
        res.json(candidate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** DELETE /api/candidates/:id  (Admin only) */
export const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        // Remove from election
        await Election.findByIdAndUpdate(candidate.election, {
            $pull: { candidates: candidate._id },
        });

        res.json({ message: "Candidate deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/** PUT /api/elections/candidates/:id  (Admin only) */
export const updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        const { name, email, password, bio, role, targetYear, targetDepartment } = req.body;

        if (name) candidate.name = name;
        if (email) candidate.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            candidate.password = await bcrypt.hash(password, salt);
        }
        if (bio !== undefined) candidate.bio = bio;
        if (role) candidate.role = role;
        if (targetYear) candidate.targetYear = targetYear;
        if (targetDepartment) candidate.targetDepartment = targetDepartment;


        if (req.files?.photo) {
            candidate.photo = req.files.photo[0].path;
        }

        await candidate.save();
        res.json(candidate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
