from mysql.connector import connect
from json import loads

def updateTable():
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
        column_names = ['id', 'problem_id', 'name', 'tags', 'difficulty', 'number_solved', 'page_url', 'time_limit', 'memory_limit', 'completed', 'completion_date', 'completion_time']
        cursor.execute('SELECT * FROM %s' % table_name)
        existing = cursor.fetchall()
        existing_ids = [exist[0] for exist in existing]
        with open('./codeforces_problems.json', 'r') as js:
            data = loads(''.join(js.readlines()))['data'] # get all lines, combine with ''
            new_items = []
            update_items = []
            # check if the data exists (if if does, compare if there is any difference, if not, add it to new_items)
            for d in data:
                values = list(d.values())
                if(values[0] in existing_ids):
                    ex_idx = existing_ids.index(values[0]) # existing id index
                    changes = []
                    for i, val in enumerate(values):
                        # print(val, existing[ex_idx][i])
                        try:
                            val = '' if (str(val) == '0' or '0.0' in str(val)) else float(val)
                            ex_val = '' if (str(existing[ex_idx][i + 1]) == '0' or '0.0' in str(existing[ex_idx][i + 1])) else float(existing[ex_idx][i + 1])
                        except:
                            val = '' if (str(val) == '0' or '0.0' in str(val)) else str(val)
                            ex_val = '' if (str(existing[ex_idx][i + 1]) == '0' or '0.0' in str(existing[ex_idx][i + 1])) else str(existing[ex_idx][i + 1])
                        # print(val, ex_val)
                        if(val != ex_val): # if there are changes appends it to changes
                            print('[%s[%d]] needs {%s} to be updated to {%s}' % (values[0], ex_idx, ex_val, val))
                            print(ex_idx, i)
                            print(existing[ex_idx])
                            print(values)
                            changes.append((column_names[i], val))
                    if(len(changes) > 0):
                        update_items.append((values[0], changes))
                else:
                    new_items.append(tuple(values + [0, None, None])) # if doesn't exist, appends the new items 
            # print(new_items)
            # 0, NULL means that we are settings the newly added values to completed = 0 and completion_date = NULL
            try:
                cursor.executemany('INSERT INTO %s(%s) VALUES (%s)' % (table_name, ','.join(column_names[1:]), ','.join(['%s' for i in column_names[1:]])), new_items)
                connection.commit()
                print("Added %d rows" % len(new_items))
            except Exception as e:
                print(e)
                connection.rollback()
            try:
                for ui in update_items:
                    cursor.execute('UPDATE %s SET %s WHERE id="%s"' % (table_name, ','.join(['%s=%s' % (col[0], col[1]) for col in ui[1]]), ui[0]))
                connection.commit()
                print('Updated %d items' % len(update_items))
            except Exception as e:
                print(e)
                connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    updateTable()