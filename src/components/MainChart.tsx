"use client"
import React, { PureComponent } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

const data = [
  {
    name: '24 Rabi al-awwal',
    attendance: 78,
    pv: 2400,
    amt: 2400,
  },
  {
    name: '23 Rabi al-awwal',
    attendance: 90,
    pv: 1398,
    amt: 2210,
  },
  {
    name: '22 Rabi al-awwal',
    attendance: 88,
    pv: 9800,
    amt: 2290,
  },
  {
    name: '21 Rabi al-awwal',
    attendance: 65,
    pv: 3908,
    amt: 2000,
  },
  {
    name: '20 Rabi al-awwal',
    attendance: 70,
    pv: 4800,
    amt: 2181,
  },
  {
    name: '17 Rabi al-awwal',
    attendance: 90,
    pv: 3800,
    amt: 2500,
  },
  {
    name: '16 Rabi al-awwal',
    attendance: 80,
    pv: 4300,
    amt: 2100,
  },
];

export default class MainChart extends PureComponent {
    static demoUrl = 'https://codesandbox.io/p/sandbox/tiny-bar-chart-xzyy8g';
  
    render() {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={150} height={40} data={data} >
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="attendance" fill="#5EB89D" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  }