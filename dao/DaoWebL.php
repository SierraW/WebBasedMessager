<?php
/**
 * Created by PhpStorm.
 * User: sierramws
 * Date: 2020-07-16
 * Time: 10:36
 */

include ('DaoWeb.php');

class DaoWebL extends DaoWeb
{
    private $log_table_name = "em_sys_log";

    public function getData($sql)
    {
        $result = parent::getData($sql);
        $this->log('GET', $result);
        return $result;
    }

    public function safeGet($stmt)
    {
        $result = parent::safeGet($stmt);
        $this->log('SAFE_GET', $result);
        return $result;
    }

    public function safeInsert($stmt)
    {
        $result = parent::safeInsert($stmt);
        $this->log('SAFE_INSERT', $result);
        return $result;
    }

    public function insert($table_name, $data_map)
    {
        $result = parent::insert($table_name, $data_map);
        $this->log('INSERT', $result);
        return $result;
    }

    public function select($table_name, $select_row_name, $condition_sql)
    {
        $result = parent::select($table_name, $select_row_name, $condition_sql);
        $this->log('SELECT', $result);
        return $result;
    }

    public function delete($table_name, $condition_sql)
    {
        $result = parent::delete($table_name, $condition_sql);
        $this->log('DELETE', $result);
        return $result;
    }

    public function update($table_name, $data_map, $condition_sql)
    {
        $result = parent::update($table_name, $data_map, $condition_sql);
        $this->log('UPDATE', $result);
        return $result;
    }

    private function log($senderName, $result) {
        $data_map = [
            'sender' => $senderName,
            'message' => $result['message'],
            'success' => $result['success'] == 'success' ? 1 : 0
        ];
        parent::insertData($this->insertSQLFromMap($this->log_table_name, $data_map));
    }
}