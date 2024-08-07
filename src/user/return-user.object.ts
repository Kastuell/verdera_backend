import { Prisma } from "@prisma/client";

export const returnUserObject: Prisma.UserSelect = {
    id: true,
    email: true,
    name: true,
    surname: true,
    family: true,
    phone: true,
    avatar: true,
    birthday: true,
    active: true,
    role: true,
    orders: true,
    supports: true,
    region: true,
    social: true,
    completeTests: {
        select: {
            test: {
                select: {
                    id: true
                }
            }

        }
    },
    completeCourseChapters: {
        select: {
            courseChapter: {
                select: {
                    id: true,
                }
            }
        }
    },
    completeCourses: {
        select: {
            course: {
                select: {
                    id: true,
                }
            }
        }
    },
    completeLection: {
        select: {
            lection: {
                select: {
                    id: true,
                }
            }
        }
    },
    boughtCourses: true
}
