<?php
include('config.php');
//include('https://raw.githubusercontent.com/SierraW/PHPDataAccessObject/master/WEB/DaoWeb.php');
include ('DaoWebL.php');

class DaoLogin extends DaoWebL {
    private $primary_table_name = "em_users";
    private $log_table_name = "em_log";
    private $user_login_column_name = "user_login";
    private $user_pass_column_name = "user_pass";
    private $salt = 'Capheny';

    function login($login_id, $password) {
        $sql = 'SELECT * FROM ' . $this->primary_table_name. ' WHERE '.$this->user_login_column_name.' = ? OR user_email = ?';

        $stmt = $this->prepare($sql);

        $stmt->bind_param("ss", $login_id, $login_id);

        $result = $this->safeGet($stmt);

        if ($this->isEmpty($result)) {
            return $this->fail('No such user "'.$login_id.'".');
        }

        if ($result['data'][0][$this->user_pass_column_name] === sha1($password.$this->salt)) {
            $output = $this->success();
            $output['data'] = $result['data'][0];
            $this->log($output);

            $this->createSession($output);

            $rows = ["id", "user_session"];
            $result = $this->select($this->primary_table_name, $rows, "user_login = '{$output['data']['user_login']}'" );
            $result['data'] = $result['data'][0];
            return $result;
        }

        return $this->fail('Incorrect Password');
    }

    function createSession($result) {
        $session = sha1($result['data']['user_login'].$result['data']['display_name'].time());
        $data_map = [
            'user_session' => $session
        ];
        $this->update($this->primary_table_name, $data_map, "user_login = '{$result['data']['user_login']}'");
    }

    function log($login_result) {
        $sql = 'INSERT INTO `'.$this->log_table_name.'`(`user_id`, `ip_addr`) VALUES ( '. $login_result['data']['id'] .',"'.$_SERVER['REMOTE_ADDR'].'")';
        $this->insertData($sql);
    }

    function checkAdmin($login_id) {
        $sql = 'SELECT role_id FROM ' . $this->primary_table_name . ' WHERE ' . $this->user_login_column_name . ' = "'. $login_id .'"';
        $output = $this->getData($sql);
        if (!$this->isEmpty($output)) {
            if ($output['role_id'] === 1) {
                return true;
            }
        }
        return false;
    }

    function signup($username, $password, $email, $display_name) {
        $role_id = 2;
        $title_id = 1;
        $act_code = "test_account";

        $sql = 'SELECT * FROM '.$this->primary_table_name.' WHERE '.$this->user_login_column_name.' =  ?';
        $stmt = $this->prepare($sql);
        $stmt->bind_param("s", $username);
        if(!($this->isEmpty($this->safeGet($stmt)))) {
            return $this->fail("Username already exist.");
        }

        $sql = 'SELECT * FROM '.$this->primary_table_name.' WHERE user_email = ?';
        $stmt = $this->prepare($sql);
        $stmt->bind_param("s", $email);
        if(!($this->isEmpty($this->safeGet($stmt)))) {
            return $this->fail("User email already exist.");
        }

        $password = sha1($password.$this->salt);
        $sql = "INSERT INTO `{$this->primary_table_name}`(`{$this->user_login_column_name}`, `{$this->user_pass_column_name}`, `user_email`, `activation_code`, `title_id`, `role_id`, `display_name`) VALUES (?, '{$password}', ?, '{$act_code}', {$title_id}, {$role_id}, ?)";
        $stmt = $this->conn->prepare($sql);
        echo $sql;
        $stmt->bind_param("sss", $username, $email, $display_name);
        return $this->safeInsert($stmt);
    }


}

$daoLogin = new DaoLogin($conn);
