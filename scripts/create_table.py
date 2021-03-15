from mysql.connector import connect

# Accessing error solution:
# https://stackoverflow.com/questions/39281594/error-1698-28000-access-denied-for-user-rootlocalhost

def createTable():
    connection = connect(
        host='localhost',
        user='codeforces_user',
        database='codeforces',
        password='CODEFORCES_password123$%^',
        # root : PASSword123$%^
    )
    table_name = 'problems'
    try:
        cursor = connection.cursor()
        column_names = ['id', 'problem_id', 'name', 'tags', 'difficulty', 'number_solved', 'page_url', 'time_limit', 'memory_limit', 'completed', 'completion_date', 'completion_time']
        datatypes = ['INT NOT NULL AUTO_INCREMENT PRIMARY KEY', 'VARCHAR(10)', 'VARCHAR(100)', 'VARCHAR(1000)', 'INT', 'INT', 'VARCHAR(500)', 'INT', 'VARCHAR(20)', 'BIT', 'DATE', 'TIME']
        # print('CREATE TABLE %s (%s)' % (table_name, ','.join(['%s %s' % (i[0], i[1]) for i in zip(column_names, datatypes)])))
        cursor.execute('DROP TABLE %s' % table_name)
        cursor.execute('CREATE TABLE %s (%s)' % (table_name, ','.join(['%s %s' % (i[0], i[1]) for i in zip(column_names, datatypes)])))
        cursor.execute('ALTER TABLE %s CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci' % table_name)
    finally:
        connection.close()

if __name__ == "__main__":
    createTable()