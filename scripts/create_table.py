from mysql.connector import connect

def createTable():
    connection = connect(
        host='sql12.freesqldatabase.com',
        user='sql12353831',
        database='sql12353831',
        password='Y4jgHbkEtI',
        port='3306'
    )
    table_name = 'problems'
    try:
        cursor = connection.cursor()
        column_names = ['id', 'name', 'tags', 'difficulty', 'number_solved', 'page_url', 'time_limit', 'memory_limit', 'completed', 'completion_date']
        datatypes = ['VARCHAR(10)', 'VARCHAR(100)', 'VARCHAR(1000)', 'INT', 'INT', 'VARCHAR(500)', 'FLOAT(2,1)', 'VARCHAR(15)', 'BIT', 'DATE']
        # print('CREATE TABLE %s (%s)' % (table_name, ','.join(['%s %s' % (i[0], i[1]) for i in zip(column_names, datatypes)])))
        cursor.execute('DROP TABLE %s' % table_name)
        cursor.execute('CREATE TABLE %s (%s)' % (table_name, ','.join(['%s %s' % (i[0], i[1]) for i in zip(column_names, datatypes)])))
        cursor.execute('ALTER TABLE %s CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci' % table_name)
    finally:
        connection.close()

if __name__ == "__main__":
    createTable()