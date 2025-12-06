<?php 
namespace App\Exception;


class UserRegisteredException extends \Exception
{
    public function __construct($message = "User with this email is already registered.", $code = 409) {
        parent::__construct($message, $code);
    }
}