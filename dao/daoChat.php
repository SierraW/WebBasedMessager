<?php
/**
 * Created by PhpStorm.
 * User: sierramws
 * Date: 2020-07-09
 * Time: 11:54
 */

include_once ('DaoWebL.php');
include_once ('config.php');

class DaoChat extends DaoWebL {
    private $user_table = 'em_users';
    private $room_table = 'em_room';
    private $attender_table = 'em_attender';
    private $msg_table = 'em_msg';
    private $title_table = 'em_title';

    function checkUser($user_id, $session) {
        return $this->select($this->user_table, ["user_login", "user_email", "display_name", "title_id", "role_id"], "id = '{$user_id}' AND user_session = '{$session}'");
    }

    function getAllDisplayedUser() {
        return $this->select($this->user_table, null, "display_homepage = 1");
    }

    //'selected', 'conTb' ['lblTb'=> 'nTb', 'on' => 0, 1, joSt], condi, orTb, lblOrTb, orBy
    function getAllRoomId($user_id) {
        $data_map = [
            'selected' => null,
            'lblOrTb' => 'a',
            'orTb' => $this->attender_table,
            'conTb' => [
                'b' => [
                    'joSt' => 'INNER JOIN',
                    'nTb' => $this->room_table,
                    'on' => ['a.chat_id', 'b.chat_id']
                ]
                ],
            'condi' => "a.user_id = '{$user_id}'",
            'orBy' => 'b.last_act_time DESC'
        ];
        return $this->joinSelect($data_map);
    }

    function getChat($chat_id) {
        $result = $this->select($this->room_table, null, "chat_id = {$chat_id}");
        if ($this->isEmpty($result)) {
            return $result;
        }
        $result['data'] = $result['data'][0];
        return $result;
    }

    function createChat($leader_id, $attender_id) {
        if ($leader_id < $attender_id) {
            $signature = md5( $leader_id . $attender_id );
        } else {
            $signature = md5( $attender_id . $leader_id );
        }
        $check_exist_sql = "SELECT * FROM {$this->room_table} WHERE room_type = 1 AND signature = '{$signature}'";
        $result = $this->getData($check_exist_sql);
        if (!$this->isEmpty($result)) {
            return $result;
        }

        $data_map = [
          "room_type" => 1,
          "signature" => $signature
        ];
        $result = $this->insert($this->room_table, $data_map);

        if ($this->isSuccess($result)) {
            $room = $this->select($this->room_table, null, "signature = '{$signature}'");
            $room_id = $room['data'][0]['chat_id'];
            $this->addMember($room_id, $leader_id, null);
            $this->addMember($room_id, $attender_id, null);
        }
        return $result;
    }

    function createGroupChat($leader_id, $attender_id) {
        $room_creation_sql = "INSERT INTO `em_room`(`name`, `room_type`, `signature`) VALUES ( ?, 2, '{$leader_id}')";
        $stmt = $this->prepare($room_creation_sql);
        $name = $this->getUserDisplayName($leader_id) . '、 ' . $this->getUserDisplayName($attender_id);
        $stmt->bind_params('s', $name);
        $result = $this->safeInsert($stmt);

        if ($this->isSuccess($result)) {
            $this->addMember($this->conn->insert_id, $leader_id);
            $this->addMember($this->conn->insert_id, $attender_id);
        }
        return $result;
    }

    function getUserDisplayName($user_id) {
        $selected_row_name = ['display_name'];
        $result = $this->select($this->user_table, $selected_row_name, "id = '{$user_id}'");
        if (!$this->isEmpty($result)) {
            return $result['data'][0]['display_name'];
        } else {
            return null;
        }
    }

    function endChat($chat_id) {
        $data_map = [
          'state_id'=>'1'
        ];
        return $this->update($this->room_table, $data_map, "chat_id = '{$chat_id}'");
    }

    function addMember($chat_id, $user_id, $sender=null) {  // sender is group starter user_id
        if ($sender != null) {
            $result = $this->getMember($chat_id);
            if (!$this->isEmpty($result)) {
                if (sizeof($result['data']) == 2) {
                    foreach ($result['data'] as $item) {
                        if ($item['user_id'] != $sender) {
                            $new_chat = $this->createGroupChat($sender, $item['user_id']);
                            if ($this->isSuccess($new_chat)) {
                                $chat_id = $this->conn->insert_id;
                            } else {
                                return $this->fail("Unable to create group.");
                            }
                            break;
                        }
                    }
                }
            }
        }
        $id = md5($chat_id.$user_id);
        $dataMap = [
            'id' => $id,
            'user_id' => $user_id,
            'chat_id' => $chat_id
        ];
        return $this->insert($this->attender_table, $dataMap);
    }

    function getMember($chat_id) {
        $data_map = [
            'selected' => ['a.*', 'b.user_login', 'b.display_name'],
            'lblOrTb' => 'a',
            'orTb' => $this->attender_table,
            'conTb' => [
                'b' => [
                    'joSt' => 'INNER JOIN',
                    'nTb' => $this->user_table,
                    'on' => ['a.user_id', 'b.id']
                ]
            ],
            'condi' => "a.chat_id = '{$chat_id}'",
            'orBy' => null
        ];
        return $this->joinSelect($data_map);
    }

    function removeMember($chat_id, $user_id) {
        $result = $this->delete($this->attender_table, 'chat_id = "'.$chat_id.'" AND user_id = "'.$user_id.'"');
        if ($this->isSuccess($result)) {
            $num_of_user_left = sizeof($this->getMember($chat_id));
            if ($num_of_user_left === 1) {
                $this->endChat($chat_id);
            } else if ($num_of_user_left === 0) {
                // remove room
            }
        }
        return $result;
    }

    function sendMsg($user_id, $chat_id, $msg, $msg_type) {
        if ($msg == null || $msg === "") {
            return $this->fail("Can not send empty message.");
        }
        $result = $this->getChat($chat_id);
        if (!$this->isSuccess($result) || $result['data']['state_id'] != 0) {
            return $this->fail("Chat unavailable.");
        }
        $data_map = [
            'message'=>$msg,
            'user_id'=>$user_id,
            'chat_id'=>$chat_id,
            'type_id'=>$msg_type
        ];
        $this->updateRoomLastAct($chat_id);
        return $this->insert($this->msg_table, $data_map);
    }

    function updateRoomLastAct($chat_id) {
        $sql = "UPDATE {$this->room_table} SET last_act_time = NOW() WHERE chat_id = '{$chat_id}'";
        $this->insertData($sql);
    }

    function getAllMsg($chat_id, $user_id) {
        $data_map = [
            'selected' => ['a.*', 'b.display_name'],
            'lblOrTb' => 'a',
            'orTb' => $this->msg_table,
            'conTb' => [
                'b' => [
                    'joSt' => 'LEFT JOIN',
                    'nTb' => $this->user_table,
                    'on' => ['a.user_id', 'b.id']
                ]
            ],
            'condi' => "a.chat_id = '{$chat_id}'",
            'orBy' => 'b.time DESC'
        ];
        $result = $this->joinSelect($data_map);
        for ($count = 0; $count < sizeof($result['data']); $count++) {
            if ($result['data'][$count]['user_id'] === $user_id) {
                $result['data'][$count]['isRead'] = "align-items-end";
            } else {
                $result['data'][$count]['isRead'] = "align-items-start";
            }
        }

        return $result;
    }

    function getNewMsg($chat_id, $user_id, $last_read) {
        $data_map = [
            'selected' => ['a.*', 'b.display_name'],
            'lblOrTb' => 'a',
            'orTb' => $this->msg_table,
            'conTb' => [
                'b' => [
                    'joSt' => 'LEFT JOIN',
                    'nTb' => $this->user_table,
                    'on' => ['a.user_id', 'b.id']
                ]
            ],
            'condi' => "a.chat_id = '{$chat_id}' AND a.msg_id > '{$last_read}'",
            'orBy' => 'a.time'
        ];
        $result = $this->joinSelect($data_map);
        for ($count = 0; $count < sizeof($result['data']); $count++) {
            if ($result['data'][$count]['user_id'] === $user_id) {
                $result['data'][$count]['isRead'] = "align-items-end";
            } else {
                $result['data'][$count]['isRead'] = "align-items-start";
            }
        }

        return $result;
    }

    function markMsgRead($msg_id) {
        $data_map = [
          'isRead'=>1
        ];
        $this->update($this->msg_table, $data_map, "msg_id = '{$msg_id}'");
    }

    function removeMsg($msg_id) {
        $this->delete($this->msg_table, "msg_id = '{$msg_id}'");
    }

    function getBroadcastUser() {
        $data_map = [
            'selected' => ['a.id', 'a.display_name', 'b.title_name'],
            'lblOrTb' => 'a',
            'orTb' => $this->user_table,
            'conTb' => [
                'b' => [
                    'joSt' => 'LEFT JOIN',
                    'nTb' => $this->title_table,
                    'on' => ['a.title_id', 'b.title_id']
                ]
            ],
            'condi' => "display_homepage = 1",
            'orBy' => 'a.id'
        ];
        return $this->joinSelect($data_map);
    }
}

$daoChat = new DaoChat($conn);

?>