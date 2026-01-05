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

// Firebase service class - УПРОЩЕННАЯ ВЕРСИЯ
class FirebaseService {
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
    // === Основные методы для работы с teacher_groups ===

    static async getTeacherGroups(teacherId) {
        try {
            console.log(`Getting teacher_groups for teacher ${teacherId}...`);
            const snapshot = await database.ref(`${TEACHER_GROUPS_COLLECTION}/${teacherId}`).once('value');

            if (!snapshot.exists()) {
                console.log(`No teacher_groups found for teacher ${teacherId}`);
                return {};
            }

            const teacherGroupsData = snapshot.val();
            console.log(`Raw teacher_groups data:`, teacherGroupsData);

            // ПРОСТО возвращаем объект как есть
            return teacherGroupsData || {};

        } catch (error) {
            console.error('Error getting teacher groups:', error);
            return {};
        }
    }

    static async addGroupToTeacher(teacherId, groupId) {
        try {
            console.log(`Writing to teacher_groups/${teacherId}/${groupId} = true`);

            // ПРЯМАЯ ЗАПИСЬ В teacher_groups
            await database.ref(`${TEACHER_GROUPS_COLLECTION}/${teacherId}/${groupId}`).set(true);

            console.log(`Successfully added group ${groupId} to teacher ${teacherId} in teacher_groups`);

        } catch (error) {
            console.error('Error adding group to teacher:', error);
            throw error;
        }
    }

    static async removeGroupFromTeacher(teacherId, groupId) {
        try {
            console.log(`Removing from teacher_groups/${teacherId}/${groupId}`);

            // ПРЯМОЕ УДАЛЕНИЕ ИЗ teacher_groups
            await database.ref(`${TEACHER_GROUPS_COLLECTION}/${teacherId}/${groupId}`).remove();

            console.log(`Successfully removed group ${groupId} from teacher ${teacherId} in teacher_groups`);

        } catch (error) {
            console.error('Error removing group from teacher:', error);
            throw error;
        }
    }

    // === Методы для преподавателей ===

    static async getTeachers() {
        try {
            const snapshot = await database.ref(TEACHERS_COLLECTION).once('value');
            if (snapshot.exists()) {
                const teachers = snapshot.val();
                // Преобразуем объект в массив
                return Object.keys(teachers)
                    .map(key => ({
                        id: key,
                        ...teachers[key]
                    }))
                    .filter(teacher => teacher.name); // Фильтруем пустые
            }
            return [];
        } catch (error) {
            console.error('Error getting teachers:', error);
            throw error;
        }
    }

    // === Методы для групп ===

    static async getGroups() {
        try {
            const snapshot = await database.ref(GROUPS_COLLECTION).once('value');
            if (snapshot.exists()) {
                const groupsData = snapshot.val();

                // ВАЖНО: Обрабатываем разные форматы данных
                console.log('PENIS');
                // Если это массив (как в вашем JSON)
                if (Array.isArray(groupsData)) {
                    console.log('ARRAY PENIS');
                    return groupsData
                        .filter((group, index) => group !== null && group.name)
                        .map((group, index) => ({
                            id: index.toString(), // Используем индекс как ID
                            ...group
                        }));
                }

                // Если это объект
                if (typeof groupsData === 'object') {
                console.log('OBJECT PENIS');
                    return Object.keys(groupsData)
                        .map(key => ({
                            id: key,
                            ...groupsData[key]
                        }))
                        .filter(group => group.name);
                }

                return [];
            }
            return [];
        } catch (error) {
            console.error('Error getting groups:', error);
            throw error;
        }
    }

    // === Вспомогательные методы ===

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

    // === Метод для проверки структуры данных ===


}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== PAGE LOADED ===');

    // Если нужно, можно сразу создать страницу
    // const page = new GroupsManagementPage();
    // document.body.appendChild(await page.render());
});