// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkaxs1Jj_X9QXSdI1j2GmABKksuJgAfS0",
    authDomain: "diploma-2c6ec.firebaseapp.com",
    databaseURL: "https://diploma-2c6ec-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "diploma-2c6ec",
    storageBucket: "diploma-2c6ec.firebasestorage.app",
    messagingSenderId: "1002617630596",
    appId: "1:1002617630596:web:b01a0e61a8017bfed9b7d1"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// Database collections
const TEACHERS_COLLECTION = 'teachers';
const GROUPS_COLLECTION = 'groups';
const TEACHER_GROUPS_COLLECTION = 'teacher_groups';

// Firebase service class
class FirebaseService {
    // Teachers methods
    static async getTeachers() {
        try {
            const snapshot = await database.ref(TEACHERS_COLLECTION).once('value');
            if (snapshot.exists()) {
                const teachers = snapshot.val();
                return Object.keys(teachers).map(key => ({
                    id: key,
                    ...teachers[key]
                }));
            }
            return [];
        } catch (error) {
            console.error('Error getting teachers:', error);
            throw error;
        }
    }

    static async addTeacher(teacherData) {
        try {
            const teacherRef = database.ref(`${TEACHERS_COLLECTION}/${teacherData.id}`);
            await teacherRef.set({
                name: teacherData.name,
                position: teacherData.position,
                email: teacherData.email,
                password: teacherData.password,
                groupCount: teacherData.groupCount || 0
            });
            return teacherData.id;
        } catch (error) {
            console.error('Error adding teacher:', error);
            throw error;
        }
    }

    static async updateTeacher(teacherId, teacherData) {
        try {
            const teacherRef = database.ref(`${TEACHERS_COLLECTION}/${teacherId}`);
            await teacherRef.update(teacherData);
        } catch (error) {
            console.error('Error updating teacher:', error);
            throw error;
        }
    }

    static async deleteTeacher(teacherId) {
        try {
            const teacherRef = database.ref(`${TEACHERS_COLLECTION}/${teacherId}`);
            await teacherRef.remove();
        } catch (error) {
            console.error('Error deleting teacher:', error);
            throw error;
        }
    }

    // Groups methods
    static async getGroups() {
        try {
            const snapshot = await database.ref(GROUPS_COLLECTION).once('value');
            if (snapshot.exists()) {
                const groups = snapshot.val();
                return Object.keys(groups).map(key => ({
                    id: key,
                    ...groups[key]
                }));
            }
            return [];
        } catch (error) {
            console.error('Error getting groups:', error);
            throw error;
        }
    }

    static async addGroup(groupData) {
        try {
            const groupRef = database.ref(`${GROUPS_COLLECTION}/${groupData.id}`);
            await groupRef.set({
                name: groupData.name,
                students: groupData.students || 0
            });
            return groupData.id;
        } catch (error) {
            console.error('Error adding group:', error);
            throw error;
        }
    }

    // Teacher-Groups relationship methods
    static async getTeacherGroups(teacherId) {
        try {
            const snapshot = await database.ref(`${TEACHER_GROUPS_COLLECTION}/${teacherId}`).once('value');
            if (snapshot.exists()) {
                return snapshot.val();
            }
            return {};
        } catch (error) {
            console.error('Error getting teacher groups:', error);
            throw error;
        }
    }

    static async addGroupToTeacher(teacherId, groupId) {
        try {
            const teacherGroupRef = database.ref(`${TEACHER_GROUPS_COLLECTION}/${teacherId}/${groupId}`);
            await teacherGroupRef.set(true);

            // Update teacher's group count
            const teacher = await this.getTeacher(teacherId);
            if (teacher) {
                await this.updateTeacher(teacherId, {
                    ...teacher,
                    groupCount: (teacher.groupCount || 0) + 1
                });
            }
        } catch (error) {
            console.error('Error adding group to teacher:', error);
            throw error;
        }
    }

    static async removeGroupFromTeacher(teacherId, groupId) {
        try {
            const teacherGroupRef = database.ref(`${TEACHER_GROUPS_COLLECTION}/${teacherId}/${groupId}`);
            await teacherGroupRef.remove();

            // Update teacher's group count
            const teacher = await this.getTeacher(teacherId);
            if (teacher) {
                await this.updateTeacher(teacherId, {
                    ...teacher,
                    groupCount: Math.max(0, (teacher.groupCount || 0) - 1)
                });
            }
        } catch (error) {
            console.error('Error removing group from teacher:', error);
            throw error;
        }
    }

    static async getTeacher(teacherId) {
        try {
            const snapshot = await database.ref(`${TEACHERS_COLLECTION}/${teacherId}`).once('value');
            if (snapshot.exists()) {
                return {
                    id: teacherId,
                    ...snapshot.val()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting teacher:', error);
            throw error;
        }
    }
}

// Initialize default data if database is empty
async function initializeDefaultData() {
    try {
        const teachers = await FirebaseService.getTeachers();
        const groups = await FirebaseService.getGroups();

        if (teachers.length === 0) {
            console.log('Initializing default teachers...');
            // Add default teachers
            const defaultTeachers = [
                {
                    id: '1',
                    name: 'Иванова Мария Петровна',
                    position: 'Старший преподаватель',
                    email: 'ivanova.mp@ugntu.ru',
                    groupCount: 3,
                    password: '-'
                },
                {
                    id: '2',
                    name: 'Петров Алексей Владимирович',
                    position: 'Доцент',
                    email: 'petrov.av@ugntu.ru',
                    groupCount: 2,
                    password: '-'
                },
                {
                    id: '3',
                    name: 'Сидорова Елена Ивановна',
                    position: 'Профессор',
                    email: 'sidorova.ei@ugntu.ru',
                    groupCount: 4,
                    password: '-'
                }
            ];

            for (const teacher of defaultTeachers) {
                await FirebaseService.addTeacher(teacher);
            }
        }

        if (groups.length === 0) {
            console.log('Initializing default groups...');
            // Add default groups
            const defaultGroups = [
                { id: '1', name: 'ИЯ-101', students: 25 },
                { id: '2', name: 'ИЯ-102', students: 28 },
                { id: '3', name: 'ИЯ-201', students: 22 },
                { id: '4', name: 'ИЯ-202', students: 24 },
                { id: '5', name: 'ИЯ-301', students: 26 },
                { id: '6', name: 'ИЯ-302', students: 23 },
                { id: '7', name: 'ИЯ-401', students: 27 },
                { id: '8', name: 'ИЯ-402', students: 25 },
                { id: '9', name: 'ИЯ-501', students: 20 },
                { id: '10', name: 'ИЯ-502', students: 22 }
            ];

            for (const group of defaultGroups) {
                await FirebaseService.addGroup(group);
            }

            // Set up default teacher-group relationships
            const defaultRelationships = {
                '1': ['1', '3', '5'],  // Иванова
                '2': ['2', '4', '6'],  // Петров
                '3': ['7', '8', '9', '10']  // Сидорова
            };

            for (const [teacherId, groupIds] of Object.entries(defaultRelationships)) {
                for (const groupId of groupIds) {
                    await FirebaseService.addGroupToTeacher(teacherId, groupId);
                }
            }
        }
    } catch (error) {
        console.error('Error initializing default data:', error);
    }
}

// Initialize default data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultData();
});
