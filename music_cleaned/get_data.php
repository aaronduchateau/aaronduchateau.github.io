<?php
// Create connection
//$con = mysqli_connect("localhost","root","gms5150","music");
$con = mysqli_connect("127.0.0.1","aaronduc_test","Music123","aaronduc_music");
//$con = mysqli_connect("127.0.0.1","aaronduc_music","aaronduc_test","Music123");

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
} 

$result = $con->query("select a.title, a.group, a.release_date, a.no_of_discs, a.wiki_link, a.recording_date, group_concat(concat_ws(' ', p.given_name, p.surname) separator ', ') as fullname from albums as a join albums_personnel on albums_personnel.album_id = a.id join personnel as p on albums_personnel.personnel_id = p.id group by a.title");

$rows = array();

while($r = mysqli_fetch_assoc($result)){
    $rows[] = $r;    
}

echo json_encode($rows);

?>