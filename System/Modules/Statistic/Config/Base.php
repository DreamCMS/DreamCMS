<?php

/**
 * DreamCMS 3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * PHP Version 5
 *
 * @package      Statistic
 * @version      3.0.0 Beta
 * @category     Config
 * @copyright    2008-2013 Marcel Domke
 * @license      http://www.gnu.org/licenses/gpl-2.0.txt GNU GENERAL PUBLIC LICENSE Version 2
 * @author       Marcel Domke <http://www.dcms-studio.de>
 * @link         http://www.dcms-studio.de
 * @file         Base.php
 */
class Statistic_Config_Base
{

	/**
	 * @var array
	 */
	public static $controllerpermBackend = array (
		'index'    => array (
			true,
			true
		),
		'worldmap' => array (
			true,
			false
		),
		'getchart' => array (
			true,
			false
		)
	);

	/**
	 * @var array
	 */
	public static $controllerpermFrontend = array (//'index' => array(false, false)
	);

	/**
	 *
	 * @param bool $getBackend default false
	 * @return array
	 */
	public static function getControllerPermissions ( $getBackend = false )
	{

		if ( !$getBackend )
		{
			return self::$controllerpermFrontend;
		}
		else
		{
			return self::$controllerpermBackend;
		}
	}

	/**
	 *
	 * @param boolean $getBackend
	 * @return array
	 */
	public static function getPermissions ( $getBackend = false )
	{

		if ( !$getBackend )
		{
			return null;
		}
		else
		{
			return array (
				'title'        => trans('Website Statistik'),
				'hidden'       => 0,
				'access-items' => array (
					'index' => array (
						trans('darf die Website Statistik nutzen'),
						0
					)
				)
			);
		}
	}

	/**
	 *
	 */
	public static function registerBackedMenu ()
	{
		$menu = array (
			'label'       => trans('Website Statistik'),
			'description' => null,
			'icon'        => null,
			'action'      => ''
		);

		Menu::addMenuItem('tools', 'statistic', $menu);
	}
	/**
	 * Used in Class SystemManager
	 *
	 * @return array
	 */
	public static function getModulDefinition ()
	{

		return array (
			'dockurl'           => 'admin.php?adm=statistic',
			'modulelabel'       => trans('Website Statistik'),
			'allowmetadata'     => false,
			'moduledescription' => trans('Zeigt Statistiken zur Website an'),
			'version'           => '0.1',
			'metatables'        => array ()
		);
	}

}
