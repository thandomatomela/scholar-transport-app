// "use client";

// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   useParams,
// } from "next/navigation";

// type ApplicationStatus =
//   | "draft"
//   | "submitted"
//   | "under_review"
//   | "changes_requested"
//   | "approved"
//   | "rejected"
//   | "converted";

// type RouteOption = {
//   id: string;
//   name: string;
//   direction:
//     | "home_to_school"
//     | "school_to_home"
//     | "both"
//     | null;
//   active: boolean;
//   notes: string | null;
// };

// type RoutesApiResponse = {
//   data?: RouteOption[];
//   error?: string;
// };

// type VehicleOption = {
//   id: string;
//   registration_number: string;
//   make: string | null;
//   model: string | null;
//   year: number | null;
//   capacity: number;
//   active: boolean;
// };

// type VehiclesApiResponse = {
//   data?: VehicleOption[];
//   error?: string;
// };

// type DriverOption = {
//   id: string;
//   full_name: string;
//   phone: string | null;
//   active: boolean;
// };

// type DriversApiResponse = {
//   data?: DriverOption[];
//   error?: string;
// };

// type ApplicationRecord = {
//   id: string;
//   status: ApplicationStatus;
//   reference_number: string | null;
//   quoted_price: number | null;
//   agreed_price: number | null;
//   parent_notes: string | null;
//   admin_notes: string | null;
//   rejection_reason: string | null;
//   submitted_at: string | null;
//   reviewed_at: string | null;
//   approved_at: string | null;
//   converted_at: string | null;
//   created_at: string;
//   updated_at: string;
// };

// type ApplicationContact = {
//   id: string;
//   full_name: string;
//   phone_number: string;
//   email: string | null;
//   relationship: string | null;
//   is_primary_contact: boolean;
//   whatsapp_enabled: boolean;
// };

// type ApplicationLearner = {
//   id: string;
//   full_name: string;
//   school_name: string | null;
//   grade: string | null;
//   transport_direction:
//     | "morning"
//     | "afternoon"
//     | "both";
//   special_notes: string | null;
// };

// type ApplicationAddress = {
//   id: string;
//   learner_application_id:
//     | string
//     | null;
//   address_type:
//     | "home"
//     | "pickup"
//     | "dropoff"
//     | "school"
//     | "extra_mural";
//   address: string;
// };

// type ApplicationSchedule = {
//   id: string;
//   learner_application_id: string;
//   day_of_week: string;
//   school_start_time: string | null;
//   school_end_time: string | null;
//   morning_transport_required: boolean;
//   afternoon_transport_required: boolean;
// };

// type ApplicationActivity = {
//   id: string;
//   learner_application_id: string;
//   activity_name: string;
//   day_of_week: string;
//   finish_time: string | null;
//   pickup_address: string | null;
// };

// type ApplicationReview = {
//   id: string;
//   route_feasible: boolean | null;
//   relationships_verified: boolean | null;
//   school_times_verified: boolean | null;
//   contact_details_verified: boolean | null;
//   recommended_route_id: string | null;
//   recommended_vehicle_id: string | null;
//   recommended_driver_id: string | null;
//   review_notes: string | null;
// };

// type ReviewFormState = {
//   route_feasible: boolean | null;
//   relationships_verified: boolean | null;
//   school_times_verified: boolean | null;
//   contact_details_verified: boolean | null;
//   recommended_route_id: string;
//   recommended_vehicle_id: string;
//   recommended_driver_id: string;
//   review_notes: string;
// };

// type ApplicationDetails = {
//   application: ApplicationRecord;
//   contacts: ApplicationContact[];
//   learners: ApplicationLearner[];
//   addresses: ApplicationAddress[];
//   schedules: ApplicationSchedule[];
//   activities: ApplicationActivity[];
//   review: ApplicationReview | null;
// };

// type ApplicationApiResponse = {
//   data?: ApplicationDetails;
//   error?: string;
// };

// function getApiUrl(): string {
//   const apiUrl =
//     process.env.NEXT_PUBLIC_API_URL;

//   if (!apiUrl) {
//     throw new Error(
//       "NEXT_PUBLIC_API_URL is not configured.",
//     );
//   }

//   return apiUrl;
// }

// function formatCurrency(
//   value: number | null,
// ): string {
//   if (value === null) {
//     return "Not set";
//   }

//   return new Intl.NumberFormat(
//     "en-ZA",
//     {
//       style: "currency",
//       currency: "ZAR",
//     },
//   ).format(value);
// }

// function formatDate(
//   value: string | null,
// ): string {
//   if (!value) {
//     return "Not set";
//   }

//   return new Date(
//     value,
//   ).toLocaleString(
//     "en-ZA",
//     {
//       dateStyle: "medium",
//       timeStyle: "short",
//     },
//   );
// }

// function formatTime(
//   value: string | null,
// ): string {
//   if (!value) {
//     return "Not set";
//   }

//   return value.slice(
//     0,
//     5,
//   );
// }

// function getStatusLabel(
//   status: ApplicationStatus,
// ): string {
//   return status
//     .split("_")
//     .map(
//       (part) =>
//         part.charAt(0).toUpperCase() +
//         part.slice(1),
//     )
//     .join(" ");
// }

// export default function ApplicationReviewPage() {
//   const params =
//     useParams<{
//       id: string;
//     }>();

//   const applicationId =
//     params.id;

  
//   const [
//   routes,
//   setRoutes,
// ] =
//   useState<RouteOption[]>([]);

//   const [
//     details,
//     setDetails,
//   ] =
//     useState<ApplicationDetails | null>(
//       null,
//     );
  
//   const [
//   drivers,
//   setDrivers,
// ] =
//   useState<DriverOption[]>([]);

//   const [
//   vehicles,
//   setVehicles,
// ] =
//   useState<VehicleOption[]>([]);

//   const [
//     loading,
//     setLoading,
//   ] =
//     useState(true);

//   const [
//   loadError,
//   setLoadError,
// ] =
//   useState<string | null>(
//     null,
//   );

// const [
//   actionError,
//   setActionError,
// ] =
//   useState<string | null>(
//     null,
//   );

// const [
//   reviewForm,
//   setReviewForm,
// ] =
//   useState<ReviewFormState>({
//     route_feasible: null,
//     relationships_verified: null,
//     school_times_verified: null,
//     contact_details_verified: null,
//     recommended_route_id: "",
//     recommended_vehicle_id: "",
//     recommended_driver_id: "",
//     review_notes: "",
//   });

// const [
//   savingReview,
//   setSavingReview,
// ] =
//   useState(false);

// const [
//   approvingApplication,
//   setApprovingApplication,
// ] =
//   useState(false);

// const [
//   approvalMessage,
//   setApprovalMessage,
// ] =
//   useState<string | null>(
//     null,
//   );

// const [
//   reviewMessage,
//   setReviewMessage,
// ] =
//   useState<string | null>(
//     null,
//   );
  
//     useEffect(() => {
//     async function loadApplication() {
//       try {
//         setLoading(true);
//         setLoadError(null);

//         const apiUrl =
//           getApiUrl();

//         const response =
//           await fetch(
//             `${apiUrl}/applications/${applicationId}`,
//             {
//               cache: "no-store",
//             },
//           );

//         const result =
//           (await response.json()) as
//             ApplicationApiResponse;

//         if (
//           !response.ok ||
//           !result.data
//         ) {
//           throw new Error(
//             result.error ??
//               "Failed to load application.",
//           );
//         }

//         setDetails(
//           result.data,
//         );

//         const loadedReview =
//           result.data.review;

//         setReviewForm({
//           route_feasible:
//             loadedReview
//               ?.route_feasible ??
//             null,

//           relationships_verified:
//             loadedReview
//               ?.relationships_verified ??
//             null,

//           school_times_verified:
//             loadedReview
//               ?.school_times_verified ??
//             null,

//           contact_details_verified:
//             loadedReview
//               ?.contact_details_verified ??
//             null,

//           recommended_route_id:
//             loadedReview
//               ?.recommended_route_id ??
//             "",

//           recommended_vehicle_id:
//             loadedReview
//               ?.recommended_vehicle_id ??
//             "",

//           recommended_driver_id:
//             loadedReview
//               ?.recommended_driver_id ??
//             "",

//           review_notes:
//             loadedReview
//               ?.review_notes ??
//             "",
//         });
//       } catch (caughtError) {
//         setLoadError(
//   caughtError instanceof Error
//     ? caughtError.message
//     : "Unable to load application.",
// );
//       } finally {
//         setLoading(false);
//       }
//     }

//     void loadApplication();
//   }, [applicationId]);

//   useEffect(() => {
//     async function loadRoutes() {
//       try {
//         const apiUrl =
//           getApiUrl();

//         const response =
//           await fetch(
//             `${apiUrl}/routes/active`,
//             {
//               cache: "no-store",
//             },
//           );

//         const result =
//           (await response.json()) as
//             RoutesApiResponse;

//         if (
//           !response.ok ||
//           !result.data
//         ) {
//           throw new Error(
//             result.error ??
//               "Failed to load routes.",
//           );
//         }

//         setRoutes(
//           result.data,
//         );
//       } catch (caughtError) {
//         console.error(
//           "Unable to load routes.",
//           caughtError,
//         );
//       }
//     }

//     void loadRoutes();
//   }, []);

//   useEffect(() => {
//     async function loadDrivers() {
//       try {
//         const apiUrl =
//           getApiUrl();

//         const response =
//           await fetch(
//             `${apiUrl}/drivers/active`,
//             {
//               cache: "no-store",
//             },
//           );

//         const result =
//           (await response.json()) as
//             DriversApiResponse;

//         if (
//           !response.ok ||
//           !result.data
//         ) {
//           throw new Error(
//             result.error ??
//               "Failed to load drivers.",
//           );
//         }

//         setDrivers(
//           result.data,
//         );
//       } catch (caughtError) {
//         console.error(
//           "Unable to load drivers.",
//           caughtError,
//         );
//       }
//     }

//     void loadDrivers();
//   }, []);

//   useEffect(() => {
//     async function loadVehicles() {
//       try {
//         const apiUrl =
//           getApiUrl();

//         const response =
//           await fetch(
//             `${apiUrl}/vehicles/active`,
//             {
//               cache: "no-store",
//             },
//           );

//         const result =
//           (await response.json()) as
//             VehiclesApiResponse;

//         if (
//           !response.ok ||
//           !result.data
//         ) {
//           throw new Error(
//             result.error ??
//               "Failed to load vehicles.",
//           );
//         }

//         setVehicles(
//           result.data,
//         );
//       } catch (caughtError) {
//         console.error(
//           "Unable to load vehicles.",
//           caughtError,
//         );
//       }
//     }

//     void loadVehicles();
//   }, []);

//   async function saveReview(): Promise<void> {
//     if (savingReview) {
//       return;
//     }

//     try {
//       setSavingReview(true);
//       setActionError(null);
//       setReviewMessage(null);

//       const apiUrl =
//         getApiUrl();

//       const response =
//         await fetch(
//           `${apiUrl}/applications/${applicationId}/review`,
//           {
//             method: "PATCH",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body:
//               JSON.stringify(
//                 reviewForm,
//               ),
//           },
//         );

//       const result =
//         (await response.json()) as {
//           data?: {
//             review:
//               ApplicationReview;

//             applicationStatus:
//               ApplicationStatus;
//           };

//           error?: string;
//         };

//       if (
//         !response.ok ||
//         !result.data
//       ) {
//         throw new Error(
//           result.error ??
//             "Failed to save application review.",
//         );
//       }

//       setDetails(
//         (currentDetails) => {
//           if (!currentDetails) {
//             return currentDetails;
//           }

//           return {
//             ...currentDetails,

//             application: {
//               ...currentDetails.application,

//               status:
//                 result.data!
//                   .applicationStatus,
//             },

//             review:
//               result.data!
//                 .review,
//           };
//         },
//       );

//       setReviewMessage(
//         "Review saved successfully.",
//       );
//     } catch (caughtError) {
//       setActionError(
//   caughtError instanceof Error
//     ? caughtError.message
//     : "Something went wrong.",
// );
//     } finally {
//       setSavingReview(false);
//     }
//   }

//   async function approveApplication(): Promise<void> {
//     if (
//       approvingApplication ||
//       savingReview
//     ) {
//       return;
//     }

//     try {
//       setApprovingApplication(true);
//       setActionError(null);
//       setApprovalMessage(null);

//       const apiUrl =
//         getApiUrl();

//       const response =
//         await fetch(
//           `${apiUrl}/applications/${applicationId}/approve`,
//           {
//             method: "POST",
//           },
//         );

//       const result =
//         (await response.json()) as {
//           data?: {
//             application_id: string;
//             status: "converted";
//             parent_id: string;
//           };

//           error?: string;
//         };

//       if (
//         !response.ok ||
//         !result.data
//       ) {
//         throw new Error(
//           result.error ??
//             "Failed to approve application.",
//         );
//       }

//       setDetails(
//         (currentDetails) => {
//           if (!currentDetails) {
//             return currentDetails;
//           }

//           return {
//             ...currentDetails,

//             application: {
//               ...currentDetails.application,
//               status: "converted",
//               approved_at:
//                 new Date().toISOString(),
//               converted_at:
//                 new Date().toISOString(),
//             },
//           };
//         },
//       );

//       setApprovalMessage(
//         "Application approved and converted successfully.",
//       );
//     } catch (caughtError) {
//       setActionError(
//   caughtError instanceof Error
//     ? caughtError.message
//     : "Something went wrong.",
// );
//     } finally {
//       setApprovingApplication(false);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex min-h-[50vh] items-center justify-center">
//         <div className="text-center">
//           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

//           <p className="mt-3 text-sm font-semibold text-slate-500">
//             Loading application...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (
//   loadError ||
//   !details
// ) {
//     return (
//       <div
//         role="alert"
//         className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700"
//       >
//         <p className="font-bold">
//           Unable to load application
//         </p>

//         <p className="mt-2 text-sm">
//           {loadError ??
//   "Application was not found."}
//         </p>
//       </div>
//     );
//   }

//   const {
//     application,
//     contacts,
//     learners,
//     addresses,
//     schedules,
//     activities,
//     review,
//   } =
//     details;

//   return (
//     <div className="space-y-6">
//       <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//         <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
//           <div>
//             <p className="text-sm font-semibold text-slate-500">
//               Transport application
//             </p>

//             <h1 className="mt-1 text-3xl font-bold text-slate-900">
//               {application.reference_number ??
//                 "No reference"}
//             </h1>

//             <p className="mt-2 text-sm text-slate-500">
//               Submitted{" "}
//               {formatDate(
//                 application.submitted_at,
//               )}
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
//               {getStatusLabel(
//                 application.status,
//               )}
//             </span>

//             <button
//               type="button"
//               className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
//             >
//               Request Changes
//             </button>

//             <button
//   type="button"
//   disabled={
//     approvingApplication ||
//     savingReview ||
//     application.status ===
//       "converted"
//   }
//   onClick={() => {
//     void approveApplication();
//   }}
//   className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
// >
//   {approvingApplication
//     ? "Approving..."
//     : application.status ===
//         "converted"
//       ? "Application Converted"
//       : "Approve Application"}
// </button>
//           </div>
//         </div>

//         {approvalMessage ? (
//   <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
//     {approvalMessage}
//   </div>
// ) : null}

//         <div className="mt-6 grid gap-4 sm:grid-cols-3">
//           <InfoCard
//             label="Quoted price"
//             value={formatCurrency(
//               application.quoted_price,
//             )}
//           />

//           <InfoCard
//             label="Agreed price"
//             value={formatCurrency(
//               application.agreed_price,
//             )}
//           />

//           <InfoCard
//             label="Current status"
//             value={getStatusLabel(
//               application.status,
//             )}
//           />
//         </div>
//       </section>

//       <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
//         <div className="space-y-6">
//           <SectionCard
//             title="Parent / guardian contacts"
//             description="Contacts submitted with the transport application."
//           >
//             <div className="space-y-4">
//               {contacts.map(
//                 (contact) => (
//                   <div
//                     key={contact.id}
//                     className="rounded-2xl border border-slate-200 p-4"
//                   >
//                     <div className="flex flex-wrap items-center gap-2">
//                       <p className="font-bold text-slate-900">
//                         {
//                           contact.full_name
//                         }
//                       </p>

//                       {contact.is_primary_contact ? (
//                         <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
//                           Primary
//                         </span>
//                       ) : null}
//                     </div>

//                     <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
//                       <p>
//                         Phone:{" "}
//                         {
//                           contact.phone_number
//                         }
//                       </p>

//                       <p>
//                         Relationship:{" "}
//                         {contact.relationship ??
//                           "Not set"}
//                       </p>

//                       <p>
//                         Email:{" "}
//                         {contact.email ??
//                           "Not set"}
//                       </p>

//                       <p>
//                         WhatsApp:{" "}
//                         {contact.whatsapp_enabled
//                           ? "Enabled"
//                           : "Disabled"}
//                       </p>
//                     </div>
//                   </div>
//                 ),
//               )}
//             </div>
//           </SectionCard>

//           <SectionCard
//             title="Learners"
//             description="Learner, school, timetable and activity information."
//           >
//             <div className="space-y-5">
//               {learners.map(
//                 (learner) => {
//                   const learnerAddresses =
//                     addresses.filter(
//                       (address) =>
//                         address.learner_application_id ===
//                         learner.id,
//                     );

//                   const learnerSchedules =
//                     schedules.filter(
//                       (schedule) =>
//                         schedule.learner_application_id ===
//                         learner.id,
//                     );

//                   const learnerActivities =
//                     activities.filter(
//                       (activity) =>
//                         activity.learner_application_id ===
//                         learner.id,
//                     );

//                   return (
//                     <div
//                       key={learner.id}
//                       className="rounded-3xl border border-slate-200 p-5"
//                     >
//                       <div>
//                         <h3 className="text-lg font-bold text-slate-900">
//                           {
//                             learner.full_name
//                           }
//                         </h3>

//                         <p className="mt-1 text-sm text-slate-500">
//                           {learner.school_name ??
//                             "School not set"}{" "}
//                           ·{" "}
//                           {learner.grade ??
//                             "Grade not set"}
//                         </p>
//                       </div>

//                       <div className="mt-5 grid gap-4 sm:grid-cols-2">
//                         <InfoCard
//                           label="Transport"
//                           value={
//                             learner.transport_direction
//                           }
//                         />

//                         <InfoCard
//                           label="Special notes"
//                           value={
//                             learner.special_notes ??
//                             "None"
//                           }
//                         />
//                       </div>

//                       <div className="mt-6">
//                         <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                           Addresses
//                         </p>

//                         <div className="mt-3 space-y-2">
//                           {learnerAddresses.map(
//                             (address) => (
//                               <div
//                                 key={
//                                   address.id
//                                 }
//                                 className="rounded-2xl bg-slate-50 p-3"
//                               >
//                                 <p className="text-xs font-bold uppercase text-slate-400">
//                                   {
//                                     address.address_type
//                                   }
//                                 </p>

//                                 <p className="mt-1 text-sm font-semibold text-slate-700">
//                                   {
//                                     address.address
//                                   }
//                                 </p>
//                               </div>
//                             ),
//                           )}
//                         </div>
//                       </div>

//                       <div className="mt-6">
//                         <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                           School schedule
//                         </p>

//                         <div className="mt-3 overflow-x-auto">
//                           <table className="min-w-full text-sm">
//                             <thead>
//                               <tr className="text-left text-xs uppercase text-slate-400">
//                                 <th className="pb-2 pr-5">
//                                   Day
//                                 </th>

//                                 <th className="pb-2 pr-5">
//                                   Start
//                                 </th>

//                                 <th className="pb-2 pr-5">
//                                   End
//                                 </th>

//                                 <th className="pb-2">
//                                   Transport
//                                 </th>
//                               </tr>
//                             </thead>

//                             <tbody>
//                               {learnerSchedules.map(
//                                 (schedule) => (
//                                   <tr
//                                     key={
//                                       schedule.id
//                                     }
//                                     className="border-t border-slate-100"
//                                   >
//                                     <td className="py-3 pr-5 font-semibold capitalize text-slate-700">
//                                       {
//                                         schedule.day_of_week
//                                       }
//                                     </td>

//                                     <td className="py-3 pr-5 text-slate-600">
//                                       {formatTime(
//                                         schedule.school_start_time,
//                                       )}
//                                     </td>

//                                     <td className="py-3 pr-5 text-slate-600">
//                                       {formatTime(
//                                         schedule.school_end_time,
//                                       )}
//                                     </td>

//                                     <td className="py-3 text-slate-600">
//                                       {schedule.morning_transport_required
//                                         ? "Morning"
//                                         : ""}
//                                       {schedule.morning_transport_required &&
//                                       schedule.afternoon_transport_required
//                                         ? " + "
//                                         : ""}
//                                       {schedule.afternoon_transport_required
//                                         ? "Afternoon"
//                                         : ""}
//                                     </td>
//                                   </tr>
//                                 ),
//                               )}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       <div className="mt-6">
//                         <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                           Extra murals
//                         </p>

//                         {learnerActivities.length >
//                         0 ? (
//                           <div className="mt-3 space-y-3">
//                             {learnerActivities.map(
//                               (activity) => (
//                                 <div
//                                   key={
//                                     activity.id
//                                   }
//                                   className="rounded-2xl bg-indigo-50 p-4"
//                                 >
//                                   <p className="font-bold text-indigo-900">
//                                     {
//                                       activity.activity_name
//                                     }
//                                   </p>

//                                   <p className="mt-1 text-sm capitalize text-indigo-700">
//                                     {
//                                       activity.day_of_week
//                                     }{" "}
//                                     ·{" "}
//                                     {formatTime(
//                                       activity.finish_time,
//                                     )}
//                                   </p>

//                                   <p className="mt-2 text-sm text-indigo-700">
//                                     Pickup:{" "}
//                                     {activity.pickup_address ??
//                                       "Not set"}
//                                   </p>
//                                 </div>
//                               ),
//                             )}
//                           </div>
//                         ) : (
//                           <p className="mt-2 text-sm text-slate-500">
//                             No extra-mural activities submitted.
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 },
//               )}
//             </div>
//           </SectionCard>

//           <SectionCard
//             title="Parent notes"
//             description="Information supplied by the parent during registration."
//           >
//             <p className="text-sm leading-6 text-slate-700">
//               {application.parent_notes ??
//                 "No parent notes supplied."}
//             </p>
//           </SectionCard>
//         </div>

//         <div className="space-y-6">
//           <SectionCard
//   title="Admin review"
//   description="Operational checks required before approval."
// >
//   <div className="space-y-4">
//     <EditableReviewCheck
//       label="Route feasible"
//       value={
//         reviewForm.route_feasible
//       }
//       onChange={(value) => {
//         setReviewForm(
//           (current) => ({
//             ...current,
//             route_feasible:
//               value,
//           }),
//         );
//       }}
//     />

//     <EditableReviewCheck
//       label="Relationships verified"
//       value={
//         reviewForm.relationships_verified
//       }
//       onChange={(value) => {
//         setReviewForm(
//           (current) => ({
//             ...current,
//             relationships_verified:
//               value,
//           }),
//         );
//       }}
//     />

//     <EditableReviewCheck
//       label="School times verified"
//       value={
//         reviewForm.school_times_verified
//       }
//       onChange={(value) => {
//         setReviewForm(
//           (current) => ({
//             ...current,
//             school_times_verified:
//               value,
//           }),
//         );
//       }}
//     />

//     <EditableReviewCheck
//       label="Contact details verified"
//       value={
//         reviewForm.contact_details_verified
//       }
//       onChange={(value) => {
//         setReviewForm(
//           (current) => ({
//             ...current,
//             contact_details_verified:
//               value,
//           }),
//         );
//       }}
//     />

//     <div>
//       <label
//         htmlFor="review-notes"
//         className="text-sm font-bold text-slate-700"
//       >
//         Review notes
//       </label>

//       <textarea
//         id="review-notes"
//         rows={5}
//         value={
//           reviewForm.review_notes
//         }
//         onChange={(event) => {
//           setReviewForm(
//             (current) => ({
//               ...current,
//               review_notes:
//                 event.target.value,
//             }),
//           );
//         }}
//         placeholder="Add internal notes about route feasibility, timing, family details, or anything requiring follow-up..."
//         className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white"
//       />
//     </div>

//     {reviewMessage ? (
//       <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
//         {reviewMessage}
//       </div>
//     ) : null}

//     <button
//       type="button"
//       disabled={
//         savingReview
//       }
//       onClick={() => {
//         void saveReview();
//       }}
//       className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
//     >
//       {savingReview
//         ? "Saving review..."
//         : "Save Review"}
//     </button>
//   </div>
// </SectionCard>

//           <SectionCard
//   title="Operational placement"
//   description="Route, vehicle and driver assignment."
// >
//   <div className="space-y-4">
//     <div>
//   <label
//     htmlFor="route-id"
//     className="text-sm font-bold text-slate-700"
//   >
//     Route
//   </label>

//   <select
//     id="route-id"
//     value={
//       reviewForm.recommended_route_id
//     }
//     onChange={(event) => {
//       setReviewForm(
//         (current) => ({
//           ...current,
//           recommended_route_id:
//             event.target.value,
//         }),
//       );
//     }}
//     className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white"
//   >
//     <option value="">
//       Select route
//     </option>

//     {routes.map(
//       (route) => (
//         <option
//           key={route.id}
//           value={route.id}
//         >
//           {route.name}
//           {route.direction
//             ? ` · ${route.direction
//                 .replaceAll(
//                   "_",
//                   " ",
//                 )}`
//             : ""}
//         </option>
//       ),
//     )}
//   </select>
// </div>

//     <div>
//   <label
//     htmlFor="vehicle-id"
//     className="text-sm font-bold text-slate-700"
//   >
//     Vehicle
//   </label>

//   <select
//     id="vehicle-id"
//     value={
//       reviewForm.recommended_vehicle_id
//     }
//     onChange={(event) => {
//       setReviewForm(
//         (current) => ({
//           ...current,
//           recommended_vehicle_id:
//             event.target.value,
//         }),
//       );
//     }}
//     className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white"
//   >
//     <option value="">
//       Select vehicle
//     </option>

//     {vehicles.map(
//       (vehicle) => (
//         <option
//           key={vehicle.id}
//           value={vehicle.id}
//         >
//           {vehicle.registration_number}
//           {" · "}
//           {vehicle.make ?? "Unknown make"}
//           {" "}
//           {vehicle.model ?? ""}
//           {" · "}
//           Capacity {vehicle.capacity}
//         </option>
//       ),
//     )}
//   </select>
// </div>

//     <div>
//   <label
//     htmlFor="driver-id"
//     className="text-sm font-bold text-slate-700"
//   >
//     Driver
//   </label>

//   <select
//     id="driver-id"
//     value={
//       reviewForm.recommended_driver_id
//     }
//     onChange={(event) => {
//       setReviewForm(
//         (current) => ({
//           ...current,
//           recommended_driver_id:
//             event.target.value,
//         }),
//       );
//     }}
//     className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white"
//   >
//     <option value="">
//       Select driver
//     </option>

//     {drivers.map(
//       (driver) => (
//         <option
//           key={driver.id}
//           value={driver.id}
//         >
//           {driver.full_name}
//           {driver.phone
//             ? ` · ${driver.phone}`
//             : ""}
//         </option>
//       ),
//     )}
//   </select>
// </div>
//   </div>
// </SectionCard>

//           <SectionCard
//             title="Review notes"
//             description="Internal operational notes."
//           >
//             <p className="text-sm leading-6 text-slate-700">
//               {review?.review_notes ??
//                 "No review notes yet."}
//             </p>
//           </SectionCard>
//         </div>
//       </section>
//     </div>
//   );
// }

// type SectionCardProps = {
//   title: string;
//   description: string;
//   children: React.ReactNode;
// };

// function SectionCard({
//   title,
//   description,
//   children,
// }: SectionCardProps) {
//   return (
//     <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//       <div>
//         <h2 className="text-lg font-bold text-slate-900">
//           {title}
//         </h2>

//         <p className="mt-1 text-sm text-slate-500">
//           {description}
//         </p>
//       </div>

//       <div className="mt-5">
//         {children}
//       </div>
//     </section>
//   );
// }

// type InfoCardProps = {
//   label: string;
//   value: string;
// };

// function InfoCard({
//   label,
//   value,
// }: InfoCardProps) {
//   return (
//     <div className="rounded-2xl bg-slate-50 p-4">
//       <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//         {label}
//       </p>

//       <p className="mt-2 font-semibold text-slate-800">
//         {value}
//       </p>
//     </div>
//   );
// }

// type EditableReviewCheckProps = {
//   label: string;
//   value: boolean | null;
//   onChange: (
//     value: boolean | null,
//   ) => void;
// };

// function EditableReviewCheck({
//   label,
//   value,
//   onChange,
// }: EditableReviewCheckProps) {
//   return (
//     <div className="rounded-2xl border border-slate-200 p-4">
//       <p className="text-sm font-semibold text-slate-700">
//         {label}
//       </p>

//       <div className="mt-3 grid grid-cols-3 gap-2">
//         <button
//           type="button"
//           onClick={() => {
//             onChange(true);
//           }}
//           className={[
//             "rounded-xl px-3 py-2 text-xs font-bold transition",
//             value === true
//               ? "bg-emerald-600 text-white"
//               : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
//           ].join(" ")}
//         >
//           Verified
//         </button>

//         <button
//           type="button"
//           onClick={() => {
//             onChange(false);
//           }}
//           className={[
//             "rounded-xl px-3 py-2 text-xs font-bold transition",
//             value === false
//               ? "bg-red-600 text-white"
//               : "bg-red-50 text-red-700 hover:bg-red-100",
//           ].join(" ")}
//         >
//           Issue
//         </button>

//         <button
//           type="button"
//           onClick={() => {
//             onChange(null);
//           }}
//           className={[
//             "rounded-xl px-3 py-2 text-xs font-bold transition",
//             value === null
//               ? "bg-slate-700 text-white"
//               : "bg-slate-100 text-slate-600 hover:bg-slate-200",
//           ].join(" ")}
//         >
//           Not Reviewed
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "converted";

type RouteOption = {
  id: string;
  name: string;
  direction:
    | "home_to_school"
    | "school_to_home"
    | "both"
    | null;
  active: boolean;
  notes: string | null;
};

type RoutesApiResponse = {
  data?: RouteOption[];
  error?: string;
};

type VehicleOption = {
  id: string;
  registration_number: string;
  make: string | null;
  model: string | null;
  year: number | null;
  capacity: number;
  active: boolean;
};

type VehiclesApiResponse = {
  data?: VehicleOption[];
  error?: string;
};

type DriverOption = {
  id: string;
  full_name: string;
  phone: string | null;
  active: boolean;
};

type DriversApiResponse = {
  data?: DriverOption[];
  error?: string;
};

type ApplicationRecord = {
  id: string;
  status: ApplicationStatus;
  reference_number: string | null;
  quoted_price: number | null;
  agreed_price: number | null;
  parent_notes: string | null;
  admin_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ApplicationContact = {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  relationship: string | null;
  is_primary_contact: boolean;
  whatsapp_enabled: boolean;
};

type ApplicationLearner = {
  id: string;
  full_name: string;
  school_name: string | null;
  grade: string | null;
  transport_direction:
    | "morning"
    | "afternoon"
    | "both";
  special_notes: string | null;
};

type ApplicationAddress = {
  id: string;
  learner_application_id:
    | string
    | null;

  address_type:
    | "home"
    | "pickup"
    | "dropoff"
    | "school"
    | "extra_mural";

  address: string;
};

type ApplicationSchedule = {
  id: string;
  learner_application_id: string;
  day_of_week: string;
  school_start_time: string | null;
  school_end_time: string | null;
  morning_transport_required: boolean;
  afternoon_transport_required: boolean;
};

type ApplicationActivity = {
  id: string;
  learner_application_id: string;
  activity_name: string;
  day_of_week: string;
  finish_time: string | null;
  pickup_address: string | null;
};

type ApplicationReview = {
  id: string;
  route_feasible: boolean | null;
  relationships_verified: boolean | null;
  school_times_verified: boolean | null;
  contact_details_verified: boolean | null;
  recommended_route_id: string | null;
  recommended_vehicle_id: string | null;
  recommended_driver_id: string | null;
  review_notes: string | null;
};

type ReviewFormState = {
  route_feasible: boolean | null;
  relationships_verified: boolean | null;
  school_times_verified: boolean | null;
  contact_details_verified: boolean | null;
  recommended_route_id: string;
  recommended_vehicle_id: string;
  recommended_driver_id: string;
  review_notes: string;
};

type ApplicationDetails = {
  application: ApplicationRecord;
  contacts: ApplicationContact[];
  learners: ApplicationLearner[];
  addresses: ApplicationAddress[];
  schedules: ApplicationSchedule[];
  activities: ApplicationActivity[];
  review: ApplicationReview | null;
};

type ApplicationApiResponse = {
  data?: ApplicationDetails;
  error?: string;
};

function getApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  return apiUrl;
}

function formatCurrency(
  value: number | null,
): string {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
    },
  ).format(value);
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not set";
  }

  return new Date(
    value,
  ).toLocaleString(
    "en-ZA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function formatTime(
  value: string | null,
): string {
  if (!value) {
    return "Not set";
  }

  return value.slice(
    0,
    5,
  );
}

function getStatusLabel(
  status: ApplicationStatus,
): string {
  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function getStatusClasses(
  status: ApplicationStatus,
): string {
  switch (status) {
    case "submitted":
      return "bg-blue-50 text-blue-700";

    case "under_review":
      return "bg-amber-50 text-amber-700";

    case "changes_requested":
      return "bg-orange-50 text-orange-700";

    case "approved":
      return "bg-emerald-50 text-emerald-700";

    case "converted":
      return "bg-violet-50 text-violet-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getTransportLabel(
  direction:
    | "morning"
    | "afternoon"
    | "both",
): string {
  switch (direction) {
    case "morning":
      return "Morning";

    case "afternoon":
      return "Afternoon";

    case "both":
      return "Morning + Afternoon";
  }
}

export default function ApplicationReviewPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const applicationId =
    params.id;

  const [
    details,
    setDetails,
  ] =
    useState<ApplicationDetails | null>(
      null,
    );

  const [
    routes,
    setRoutes,
  ] =
    useState<RouteOption[]>([]);

  const [
    vehicles,
    setVehicles,
  ] =
    useState<VehicleOption[]>([]);

  const [
    drivers,
    setDrivers,
  ] =
    useState<DriverOption[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /*
   * loadError is ONLY for initial page loading.
   *
   * If this is set, the application page
   * genuinely cannot be displayed.
   */
  const [
    loadError,
    setLoadError,
  ] =
    useState<string | null>(
      null,
    );

  /*
   * actionError is for Save Review / Approve.
   *
   * These errors appear in a modal and do
   * not destroy the application page.
   */
  const [
    actionError,
    setActionError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    reviewForm,
    setReviewForm,
  ] =
    useState<ReviewFormState>({
      route_feasible:
        null,

      relationships_verified:
        null,

      school_times_verified:
        null,

      contact_details_verified:
        null,

      recommended_route_id:
        "",

      recommended_vehicle_id:
        "",

      recommended_driver_id:
        "",

      review_notes:
        "",
    });

  const [
    savingReview,
    setSavingReview,
  ] =
    useState(false);

  const [
    approvingApplication,
    setApprovingApplication,
  ] =
    useState(false);

  const [
    reviewMessage,
    setReviewMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    approvalMessage,
    setApprovalMessage,
  ] =
    useState<string | null>(
      null,
    );

  /*
   * APPLICATION
   */
  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true);
        setLoadError(null);

        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/applications/${applicationId}`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            ApplicationApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load application.",
          );
        }

        setDetails(
          result.data,
        );

        const loadedReview =
          result.data.review;

        setReviewForm({
          route_feasible:
            loadedReview
              ?.route_feasible ??
            null,

          relationships_verified:
            loadedReview
              ?.relationships_verified ??
            null,

          school_times_verified:
            loadedReview
              ?.school_times_verified ??
            null,

          contact_details_verified:
            loadedReview
              ?.contact_details_verified ??
            null,

          recommended_route_id:
            loadedReview
              ?.recommended_route_id ??
            "",

          recommended_vehicle_id:
            loadedReview
              ?.recommended_vehicle_id ??
            "",

          recommended_driver_id:
            loadedReview
              ?.recommended_driver_id ??
            "",

          review_notes:
            loadedReview
              ?.review_notes ??
            "",
        });
      } catch (caughtError) {
        setLoadError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load application.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadApplication();
  }, [applicationId]);

  /*
   * ROUTES
   */
  useEffect(() => {
    async function loadRoutes() {
      try {
        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/routes/active`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            RoutesApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load routes.",
          );
        }

        setRoutes(
          result.data,
        );
      } catch (caughtError) {
        console.error(
          "Unable to load routes.",
          caughtError,
        );
      }
    }

    void loadRoutes();
  }, []);

  /*
   * VEHICLES
   */
  useEffect(() => {
    async function loadVehicles() {
      try {
        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/vehicles/active`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            VehiclesApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load vehicles.",
          );
        }

        setVehicles(
          result.data,
        );
      } catch (caughtError) {
        console.error(
          "Unable to load vehicles.",
          caughtError,
        );
      }
    }

    void loadVehicles();
  }, []);

  /*
   * DRIVERS
   */
  useEffect(() => {
    async function loadDrivers() {
      try {
        const apiUrl =
          getApiUrl();

        const response =
          await fetch(
            `${apiUrl}/drivers/active`,
            {
              cache: "no-store",
            },
          );

        const result =
          (await response.json()) as
            DriversApiResponse;

        if (
          !response.ok ||
          !result.data
        ) {
          throw new Error(
            result.error ??
              "Failed to load drivers.",
          );
        }

        setDrivers(
          result.data,
        );
      } catch (caughtError) {
        console.error(
          "Unable to load drivers.",
          caughtError,
        );
      }
    }

    void loadDrivers();
  }, []);

  async function saveReview():
    Promise<void> {
    if (
      savingReview ||
      approvingApplication
    ) {
      return;
    }

    try {
      setSavingReview(true);

      setActionError(
        null,
      );

      setReviewMessage(
        null,
      );

      setApprovalMessage(
        null,
      );

      const apiUrl =
        getApiUrl();

      const response =
        await fetch(
          `${apiUrl}/applications/${applicationId}/review`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                reviewForm,
              ),
          },
        );

      const result =
        (await response.json()) as {
          data?: {
            review:
              ApplicationReview;

            applicationStatus:
              ApplicationStatus;
          };

          error?: string;
        };

      if (
        !response.ok ||
        !result.data
      ) {
        throw new Error(
          result.error ??
            "Failed to save application review.",
        );
      }

      setDetails(
        (
          currentDetails,
        ) => {
          if (
            !currentDetails
          ) {
            return currentDetails;
          }

          return {
            ...currentDetails,

            application: {
              ...currentDetails
                .application,

              status:
                result.data!
                  .applicationStatus,
            },

            review:
              result.data!
                .review,
          };
        },
      );

      setReviewMessage(
        "Review saved successfully.",
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save application review.",
      );
    } finally {
      setSavingReview(false);
    }
  }

  async function approveApplication():
    Promise<void> {
    if (
      approvingApplication ||
      savingReview
    ) {
      return;
    }

    try {
      setApprovingApplication(
        true,
      );

      setActionError(
        null,
      );

      setApprovalMessage(
        null,
      );

      const apiUrl =
        getApiUrl();

      const response =
        await fetch(
          `${apiUrl}/applications/${applicationId}/approve`,
          {
            method:
              "POST",
          },
        );

      const result =
        (await response.json()) as {
          data?: {
            application_id:
              string;

            status:
              "converted";

            parent_id:
              string;
          };

          error?: string;
        };

      if (
        !response.ok ||
        !result.data
      ) {
        throw new Error(
          result.error ??
            "Failed to approve application.",
        );
      }

      const now =
        new Date()
          .toISOString();

      setDetails(
        (
          currentDetails,
        ) => {
          if (
            !currentDetails
          ) {
            return currentDetails;
          }

          return {
            ...currentDetails,

            application: {
              ...currentDetails
                .application,

              status:
                "converted",

              approved_at:
                now,

              converted_at:
                now,
            },
          };
        },
      );

      setApprovalMessage(
        "Application approved and converted successfully.",
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to approve application.",
      );
    } finally {
      setApprovingApplication(
        false,
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Full-page errors are ONLY used when
   * the application itself cannot load.
   */
  if (
    loadError ||
    !details
  ) {
    return (
      <div
        role="alert"
        className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700"
      >
        <p className="font-bold">
          Unable to load application
        </p>

        <p className="mt-2 text-sm">
          {loadError ??
            "Application was not found."}
        </p>
      </div>
    );
  }

  const {
    application,
    contacts,
    learners,
    addresses,
    schedules,
    activities,
  } =
    details;

  const applicationLocked =
    application.status ===
      "converted" ||
    application.status ===
      "rejected";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Transport application
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {application
                .reference_number ??
                "No reference"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Submitted{" "}
              {formatDate(
                application
                  .submitted_at,
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={[
                "rounded-full px-4 py-2 text-sm font-bold",
                getStatusClasses(
                  application.status,
                ),
              ].join(" ")}
            >
              {getStatusLabel(
                application.status,
              )}
            </span>

            <button
              type="button"
              disabled={
                applicationLocked
              }
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Request Changes
            </button>

            <button
              type="button"
              disabled={
                approvingApplication ||
                savingReview ||
                application.status ===
                  "converted"
              }
              onClick={() => {
                void approveApplication();
              }}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approvingApplication
                ? "Approving..."
                : application.status ===
                    "converted"
                  ? "Application Converted"
                  : "Approve Application"}
            </button>
          </div>
        </div>

        {approvalMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {approvalMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoCard
            label="Quoted price"
            value={formatCurrency(
              application
                .quoted_price,
            )}
          />

          <InfoCard
            label="Agreed price"
            value={formatCurrency(
              application
                .agreed_price,
            )}
          />

          <InfoCard
            label="Current status"
            value={getStatusLabel(
              application.status,
            )}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="Parent / guardian contacts"
            description="Contacts submitted with the transport application."
          >
            {contacts.length >
            0 ? (
              <div className="space-y-4">
                {contacts.map(
                  (
                    contact,
                  ) => (
                    <div
                      key={
                        contact.id
                      }
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {
                            contact.full_name
                          }
                        </p>

                        {contact.is_primary_contact ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                            Primary
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          Phone:{" "}
                          {
                            contact.phone_number
                          }
                        </p>

                        <p>
                          Relationship:{" "}
                          {contact.relationship ??
                            "Not set"}
                        </p>

                        <p>
                          Email:{" "}
                          {contact.email ??
                            "Not set"}
                        </p>

                        <p>
                          WhatsApp:{" "}
                          {contact.whatsapp_enabled
                            ? "Enabled"
                            : "Disabled"}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <EmptyText>
                No contacts supplied.
              </EmptyText>
            )}
          </SectionCard>

          <SectionCard
            title="Learners"
            description="Learner, school, timetable and activity information."
          >
            <div className="space-y-5">
              {learners.map(
                (
                  learner,
                ) => {
                  const learnerAddresses =
                    addresses.filter(
                      (
                        address,
                      ) =>
                        address
                          .learner_application_id ===
                        learner.id,
                    );

                  const learnerSchedules =
                    schedules.filter(
                      (
                        schedule,
                      ) =>
                        schedule
                          .learner_application_id ===
                        learner.id,
                    );

                  const learnerActivities =
                    activities.filter(
                      (
                        activity,
                      ) =>
                        activity
                          .learner_application_id ===
                        learner.id,
                    );

                  return (
                    <div
                      key={
                        learner.id
                      }
                      className="rounded-3xl border border-slate-200 p-5"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {
                            learner.full_name
                          }
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {learner.school_name ??
                            "School not set"}
                          {" · "}
                          {learner.grade ??
                            "Grade not set"}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <InfoCard
                          label="Transport"
                          value={getTransportLabel(
                            learner
                              .transport_direction,
                          )}
                        />

                        <InfoCard
                          label="Special notes"
                          value={
                            learner.special_notes ??
                            "None"
                          }
                        />
                      </div>

                      <div className="mt-6">
                        <SectionLabel>
                          Addresses
                        </SectionLabel>

                        {learnerAddresses.length >
                        0 ? (
                          <div className="mt-3 space-y-2">
                            {learnerAddresses.map(
                              (
                                address,
                              ) => (
                                <div
                                  key={
                                    address.id
                                  }
                                  className="rounded-2xl bg-slate-50 p-3"
                                >
                                  <p className="text-xs font-bold uppercase text-slate-400">
                                    {
                                      address.address_type
                                    }
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {
                                      address.address
                                    }
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <EmptyText>
                            No addresses supplied.
                          </EmptyText>
                        )}
                      </div>

                      <div className="mt-6">
                        <SectionLabel>
                          School schedule
                        </SectionLabel>

                        {learnerSchedules.length >
                        0 ? (
                          <div className="mt-3 overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="text-left text-xs uppercase text-slate-400">
                                  <th className="pb-2 pr-5">
                                    Day
                                  </th>

                                  <th className="pb-2 pr-5">
                                    Start
                                  </th>

                                  <th className="pb-2 pr-5">
                                    End
                                  </th>

                                  <th className="pb-2">
                                    Transport
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {learnerSchedules.map(
                                  (
                                    schedule,
                                  ) => (
                                    <tr
                                      key={
                                        schedule.id
                                      }
                                      className="border-t border-slate-100"
                                    >
                                      <td className="py-3 pr-5 font-semibold capitalize text-slate-700">
                                        {
                                          schedule.day_of_week
                                        }
                                      </td>

                                      <td className="py-3 pr-5 text-slate-600">
                                        {formatTime(
                                          schedule
                                            .school_start_time,
                                        )}
                                      </td>

                                      <td className="py-3 pr-5 text-slate-600">
                                        {formatTime(
                                          schedule
                                            .school_end_time,
                                        )}
                                      </td>

                                      <td className="py-3 text-slate-600">
                                        {schedule.morning_transport_required
                                          ? "Morning"
                                          : ""}

                                        {schedule.morning_transport_required &&
                                        schedule.afternoon_transport_required
                                          ? " + "
                                          : ""}

                                        {schedule.afternoon_transport_required
                                          ? "Afternoon"
                                          : ""}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <EmptyText>
                            No school schedule supplied.
                          </EmptyText>
                        )}
                      </div>

                      <div className="mt-6">
                        <SectionLabel>
                          Extra murals
                        </SectionLabel>

                        {learnerActivities.length >
                        0 ? (
                          <div className="mt-3 space-y-3">
                            {learnerActivities.map(
                              (
                                activity,
                              ) => (
                                <div
                                  key={
                                    activity.id
                                  }
                                  className="rounded-2xl bg-indigo-50 p-4"
                                >
                                  <p className="font-bold text-indigo-900">
                                    {
                                      activity.activity_name
                                    }
                                  </p>

                                  <p className="mt-1 text-sm capitalize text-indigo-700">
                                    {
                                      activity.day_of_week
                                    }
                                    {" · "}
                                    {formatTime(
                                      activity
                                        .finish_time,
                                    )}
                                  </p>

                                  <p className="mt-2 text-sm text-indigo-700">
                                    Pickup:{" "}
                                    {activity.pickup_address ??
                                      "Not set"}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <EmptyText>
                            No extra-mural activities submitted.
                          </EmptyText>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Parent notes"
            description="Information supplied by the parent during registration."
          >
            <p className="text-sm leading-6 text-slate-700">
              {application.parent_notes ??
                "No parent notes supplied."}
            </p>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Admin review"
            description="Operational checks required before approval."
          >
            <div className="space-y-4">
              <EditableReviewCheck
                label="Route feasible"
                value={
                  reviewForm
                    .route_feasible
                }
                disabled={
                  applicationLocked
                }
                onChange={(
                  value,
                ) => {
                  setReviewForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      route_feasible:
                        value,
                    }),
                  );
                }}
              />

              <EditableReviewCheck
                label="Relationships verified"
                value={
                  reviewForm
                    .relationships_verified
                }
                disabled={
                  applicationLocked
                }
                onChange={(
                  value,
                ) => {
                  setReviewForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      relationships_verified:
                        value,
                    }),
                  );
                }}
              />

              <EditableReviewCheck
                label="School times verified"
                value={
                  reviewForm
                    .school_times_verified
                }
                disabled={
                  applicationLocked
                }
                onChange={(
                  value,
                ) => {
                  setReviewForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      school_times_verified:
                        value,
                    }),
                  );
                }}
              />

              <EditableReviewCheck
                label="Contact details verified"
                value={
                  reviewForm
                    .contact_details_verified
                }
                disabled={
                  applicationLocked
                }
                onChange={(
                  value,
                ) => {
                  setReviewForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      contact_details_verified:
                        value,
                    }),
                  );
                }}
              />

              <div>
                <label
                  htmlFor="review-notes"
                  className="text-sm font-bold text-slate-700"
                >
                  Review notes
                </label>

                <textarea
                  id="review-notes"
                  rows={5}
                  disabled={
                    applicationLocked
                  }
                  value={
                    reviewForm
                      .review_notes
                  }
                  onChange={(
                    event,
                  ) => {
                    setReviewForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        review_notes:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  placeholder="Add internal notes about route feasibility, timing, family details, or follow-up..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {reviewMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                  {
                    reviewMessage
                  }
                </div>
              ) : null}

              <button
                type="button"
                disabled={
                  savingReview ||
                  approvingApplication ||
                  applicationLocked
                }
                onClick={() => {
                  void saveReview();
                }}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingReview
                  ? "Saving review..."
                  : applicationLocked
                    ? "Review Locked"
                    : "Save Review"}
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="Operational placement"
            description="Route, vehicle and driver assignment."
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="route-id"
                  className="text-sm font-bold text-slate-700"
                >
                  Route
                </label>

                <select
                  id="route-id"
                  disabled={
                    applicationLocked
                  }
                  value={
                    reviewForm
                      .recommended_route_id
                  }
                  onChange={(
                    event,
                  ) => {
                    setReviewForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        recommended_route_id:
                          event
                            .target
                            .value,
                      }),
                    );
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select route
                  </option>

                  {routes.map(
                    (
                      route,
                    ) => (
                      <option
                        key={
                          route.id
                        }
                        value={
                          route.id
                        }
                      >
                        {
                          route.name
                        }

                        {route.direction
                          ? ` · ${route.direction.replaceAll(
                              "_",
                              " ",
                            )}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="vehicle-id"
                  className="text-sm font-bold text-slate-700"
                >
                  Vehicle
                </label>

                <select
                  id="vehicle-id"
                  disabled={
                    applicationLocked
                  }
                  value={
                    reviewForm
                      .recommended_vehicle_id
                  }
                  onChange={(
                    event,
                  ) => {
                    setReviewForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        recommended_vehicle_id:
                          event
                            .target
                            .value,
                      }),
                    );
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select vehicle
                  </option>

                  {vehicles.map(
                    (
                      vehicle,
                    ) => (
                      <option
                        key={
                          vehicle.id
                        }
                        value={
                          vehicle.id
                        }
                      >
                        {
                          vehicle.registration_number
                        }
                        {" · "}
                        {vehicle.make ??
                          "Unknown make"}
                        {" "}
                        {vehicle.model ??
                          ""}
                        {" · "}
                        Capacity{" "}
                        {
                          vehicle.capacity
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="driver-id"
                  className="text-sm font-bold text-slate-700"
                >
                  Driver
                </label>

                <select
                  id="driver-id"
                  disabled={
                    applicationLocked
                  }
                  value={
                    reviewForm
                      .recommended_driver_id
                  }
                  onChange={(
                    event,
                  ) => {
                    setReviewForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        recommended_driver_id:
                          event
                            .target
                            .value,
                      }),
                    );
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Select driver
                  </option>

                  {drivers.map(
                    (
                      driver,
                    ) => (
                      <option
                        key={
                          driver.id
                        }
                        value={
                          driver.id
                        }
                      >
                        {
                          driver.full_name
                        }

                        {driver.phone
                          ? ` · ${driver.phone}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Application timeline"
            description="Review and conversion history."
          >
            <div className="space-y-4">
              <TimelineRow
                label="Submitted"
                value={formatDate(
                  application
                    .submitted_at,
                )}
              />

              <TimelineRow
                label="Reviewed"
                value={formatDate(
                  application
                    .reviewed_at,
                )}
              />

              <TimelineRow
                label="Approved"
                value={formatDate(
                  application
                    .approved_at,
                )}
              />

              <TimelineRow
                label="Converted"
                value={formatDate(
                  application
                    .converted_at,
                )}
              />
            </div>
          </SectionCard>
        </div>
      </section>

      {/*
       * ACTION ERROR MODAL
       *
       * Save/approval errors appear here.
       * The underlying application page
       * remains fully visible.
       */}
      {actionError ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-error-title"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setActionError(
                null,
              );
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
                  !
                </div>

                <p
                  id="action-error-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Action could not be completed
                </p>

                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  {
                    actionError
                  }
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  No application data has been removed.
                  Correct the issue and try again.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close error"
                onClick={() => {
                  setActionError(
                    null,
                  );
                }}
                className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActionError(
                    null,
                  );
                }}
                className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  children:
    React.ReactNode;
};

function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

type InfoCardProps = {
  label: string;
  value: string;
};

function InfoCard({
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

type EditableReviewCheckProps = {
  label: string;
  value:
    | boolean
    | null;
  disabled?: boolean;
  onChange: (
    value:
      | boolean
      | null,
  ) => void;
};

function EditableReviewCheck({
  label,
  value,
  disabled = false,
  onChange,
}: EditableReviewCheckProps) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-700">
        {label}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={
            disabled
          }
          onClick={() => {
            onChange(
              true,
            );
          }}
          className={[
            "rounded-xl px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
            value === true
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          ].join(" ")}
        >
          Verified
        </button>

        <button
          type="button"
          disabled={
            disabled
          }
          onClick={() => {
            onChange(
              false,
            );
          }}
          className={[
            "rounded-xl px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
            value === false
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100",
          ].join(" ")}
        >
          Issue
        </button>

        <button
          type="button"
          disabled={
            disabled
          }
          onClick={() => {
            onChange(
              null,
            );
          }}
          className={[
            "rounded-xl px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
            value === null
              ? "bg-slate-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          ].join(" ")}
        >
          Not Reviewed
        </button>
      </div>
    </div>
  );
}

type TimelineRowProps = {
  label: string;
  value: string;
};

function TimelineRow({
  label,
  value,
}: TimelineRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-600">
        {label}
      </span>

      <span className="text-right text-sm text-slate-500">
        {value}
      </span>
    </div>
  );
}

type SectionLabelProps = {
  children:
    React.ReactNode;
};

function SectionLabel({
  children,
}: SectionLabelProps) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

type EmptyTextProps = {
  children:
    React.ReactNode;
};

function EmptyText({
  children,
}: EmptyTextProps) {
  return (
    <p className="mt-3 text-sm text-slate-500">
      {children}
    </p>
  );
}