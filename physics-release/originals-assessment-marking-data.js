// Exact reviewed task contexts and deliberately bounded response forms.
// Generated mechanically; answer-only policies require implementation review.
export const ASSESSMENT_MARKING = {
  "neo-physics-foundations-01-q02": {
    "context": {
      "number": 2,
      "prompt": "An inspection robot moves along a straight tunnel. Its velocity v is positive towards the tunnel entrance. The graph shows its motion for 6.0 s.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the displacement of the robot during the 6.0 s. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the total distance travelled during the 6.0 s. [2]",
          "marks": 2
        },
        {
          "label": "c",
          "text": "Explain why the answers to (a) and (b) differ. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "0 m",
            "working": "Signed area = 3 × 2 + ½ × 1 × 3 − ½ × 1 × 3 − 3 × 2 = 0 m.",
            "marking_points": [
              {
                "text": "Uses signed areas under the velocity–time graph, with negative area below the axis.",
                "marks": 1
              },
              {
                "text": "Obtains 0 m from 6 + 1.5 − 1.5 − 6.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "15 m",
            "working": "Distance = 6 + 1.5 + 1.5 + 6 = 15 m.",
            "marking_points": [
              {
                "text": "Adds the magnitudes of the positive and negative areas, including the two reversal triangles.",
                "marks": 1
              },
              {
                "text": "Obtains 15 m.",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "The robot reverses direction; opposite signed displacements cancel, but all motion contributes positively to distance.",
            "working": "The velocity changes sign, so the robot travels in opposite directions. Signed areas cancel in displacement; absolute areas add in distance.",
            "marking_points": [
              {
                "text": "Identifies reversal of direction when velocity changes sign.",
                "marks": 1
              },
              {
                "text": "Explains signed cancellation for displacement versus addition of magnitudes for distance.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q02-velocity.svg",
      "alt": "Velocity–time graph joining (0 s, 3 m s⁻¹), (2 s, 3 m s⁻¹), (4 s, −3 m s⁻¹) and (6 s, −3 m s⁻¹)."
    },
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        1
      ],
      "c": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-01-q04": {
    "context": {
      "number": 4,
      "prompt": "A 0.40 kg ball travels horizontally towards a vertical cushion at 5.0 m s⁻¹ and rebounds at 3.0 m s⁻¹ along the same line. The contact time is 0.080 s. Take the direction towards the cushion as positive. Consider only the horizontal motion.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the horizontal impulse on the ball. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the average horizontal resultant force on the ball during contact. [1]",
          "marks": 1
        },
        {
          "label": "c",
          "text": "State the average horizontal force exerted by the ball on the cushion and explain its direction. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "−3.2 N s",
            "working": "u = +5.0 m s⁻¹, v = −3.0 m s⁻¹. J = m(v − u) = 0.40(−3.0 − 5.0) = −3.2 N s.",
            "marking_points": [
              {
                "text": "Uses J = m(v − u) with a negative rebound velocity.",
                "marks": 1
              },
              {
                "text": "Obtains −3.2 N s, or 3.2 N s away from the cushion.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "−40 N",
            "working": "F = −3.2/0.080 = −40 N.",
            "marking_points": [
              {
                "text": "Obtains −40 N, or 40 N away from the cushion, with consistent follow-through from (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "+40 N, towards the cushion",
            "working": "The cushion exerts −40 N on the ball. The ball exerts +40 N on the cushion by Newton’s third law.",
            "marking_points": [
              {
                "text": "States equal magnitude 40 N towards the cushion (positive direction).",
                "marks": 1
              },
              {
                "text": "Explains the forces are an equal-and-opposite Newton third-law pair acting on different bodies.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        0
      ],
      "c": [
        0
      ]
    }
  },
  "neo-physics-foundations-01-q06": {
    "context": {
      "number": 6,
      "prompt": "During an 8.0 s lift, a motor receives 5.0 kJ of electrical energy. The useful increase in gravitational potential energy of the load is 3.2 kJ.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the efficiency of the motor for this lift. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the average useful output power. [1]",
          "marks": 1
        },
        {
          "label": "c",
          "text": "Determine the energy not transferred usefully and suggest where it goes. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "64%",
            "working": "η = Euseful/Ein = 3.2/5.0 = 0.64 = 64%.",
            "marking_points": [
              {
                "text": "Uses useful energy divided by input energy.",
                "marks": 1
              },
              {
                "text": "Obtains 0.64 or 64%.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "400 W",
            "working": "Puseful = 3200/8.0 = 400 W.",
            "marking_points": [
              {
                "text": "Obtains 400 W using 3200 J divided by 8.0 s.",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "1.8 kJ; mainly thermal energy in the motor and surroundings",
            "working": "5.0 − 3.2 = 1.8 kJ. Resistive heating and friction transfer this energy to thermal stores (and possibly sound).",
            "marking_points": [
              {
                "text": "Obtains 1.8 kJ of non-usefully transferred energy.",
                "marks": 1
              },
              {
                "text": "Identifies a plausible dissipative transfer, such as resistive heating or frictional heating.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        0
      ],
      "c": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-01-q08": {
    "context": {
      "number": 8,
      "prompt": "A 0.20 kg metal sample at 70°C is placed in 0.15 kg of water at 20°C. The specific heat capacities of the metal and water are 900 J kg⁻¹ K⁻¹ and 4200 J kg⁻¹ K⁻¹ respectively. The container is thermally insulated and has negligible heat capacity. Neither substance changes state. They reach a common final temperature.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the final temperature. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Explain why the final temperature is closer to the water’s initial temperature than to the metal’s initial temperature. [1]",
          "marks": 1
        }
      ],
      "answer": {
        "explanation": "The worked answers and marking points are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "31°C (31.1°C before rounding)",
            "working": "0.20 × 900 × (70 − T) = 0.15 × 4200 × (T − 20). Thus 180(70 − T) = 630(T − 20), giving 810T = 25 200 and T = 31.1°C.",
            "marking_points": [
              {
                "text": "Sets heat lost by metal equal to heat gained by water with correct masses and temperature differences.",
                "marks": 1
              },
              {
                "text": "Solves to obtain 31°C; accept 31.1°C.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "The water has the larger total heat capacity, so the same transferred energy causes a smaller temperature change in the water.",
            "working": "mc for water = 630 J K⁻¹; mc for metal = 180 J K⁻¹. Equal energy transfer therefore produces a smaller change in water temperature.",
            "marking_points": [
              {
                "text": "Relates the water’s larger mc to its smaller temperature change for the same energy transfer.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        0
      ]
    }
  },
  "neo-physics-foundations-01-q10": {
    "context": {
      "number": 10,
      "prompt": "Two coherent wave sources oscillate in phase and produce waves of wavelength 0.60 m in the same medium. Their distances from point P are 2.4 m and 3.3 m. Each wave has displacement amplitude 4.0 mm at P. Reflections can be neglected.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the path difference at P. [1]",
          "marks": 1
        },
        {
          "label": "b",
          "text": "Explain why the resultant displacement amplitude at P is zero. [2]",
          "marks": 2
        },
        {
          "label": "c",
          "text": "At another point Q, the path difference is 1.2 m. State the type of interference at Q. [1]",
          "marks": 1
        }
      ],
      "answer": {
        "explanation": "The worked answers and marking points are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "0.90 m",
            "working": "Δd = 3.3 − 2.4 = 0.90 m.",
            "marking_points": [
              {
                "text": "Obtains 0.90 m.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "The path difference is 1.5 wavelengths, so the waves arrive in antiphase. Their equal amplitudes cancel by superposition.",
            "working": "0.90/0.60 = 1.5. This is a half-integer number of wavelengths, so one wave is half a cycle out of phase with the other. The resultant amplitude is |4.0 − 4.0| = 0 mm.",
            "marking_points": [
              {
                "text": "Identifies the half-integer wavelength path difference as producing antiphase/destructive interference.",
                "marks": 1
              },
              {
                "text": "Uses equal amplitudes and superposition to explain complete cancellation.",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "Constructive interference.",
            "working": "1.2/0.60 = 2, a whole number of wavelengths, so the waves arrive in phase.",
            "marking_points": [
              {
                "text": "States constructive interference.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        0
      ],
      "b": [
        0,
        1
      ],
      "c": [
        0
      ]
    }
  },
  "neo-physics-foundations-01-q12": {
    "context": {
      "number": 12,
      "prompt": "A small platform is suspended from a spring. Its natural frequency is 3.0 Hz. A motor applies a periodic force of constant amplitude while its driving frequency is varied slowly. The platform is initially lightly damped, and its steady-state oscillation amplitude is measured at each driving frequency.",
      "parts": [
        {
          "label": "a",
          "text": "Explain why the platform reaches a large but finite steady-state amplitude near 3.0 Hz. [3]",
          "marks": 3
        },
        {
          "label": "b",
          "text": "The damping is increased while the driving-force amplitude is unchanged. The platform remains lightly damped with a distinct resonance peak. State the changes to the maximum amplitude and the width of the peak in the amplitude–driving-frequency response curve. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "Near the natural frequency, resonance transfers energy efficiently; amplitude grows until energy supplied per cycle equals energy dissipated by damping.",
            "working": "At driving frequency near 3.0 Hz, resonance produces repeated favourable energy input. The amplitude grows; the steady state is reached when energy input per cycle balances damped losses.",
            "marking_points": [
              {
                "text": "Identifies resonance when driving frequency is near the natural frequency.",
                "marks": 1
              },
              {
                "text": "Explains efficient repeated energy transfer from the driver to the platform.",
                "marks": 1
              },
              {
                "text": "Explains finite steady-state amplitude by energy input balancing damping losses.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "The maximum amplitude decreases and the resonance peak becomes broader.",
            "working": "The larger dissipation reduces the maximum steady-state amplitude. With a distinct resonance still present, the response is less selective in frequency, so the peak is broader.",
            "marking_points": [
              {
                "text": "States that the maximum amplitude decreases.",
                "marks": 1
              },
              {
                "text": "States that the resonance peak broadens (the response becomes less sharply peaked).",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        0,
        1,
        2
      ],
      "b": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-02-q02": {
    "context": {
      "number": 14,
      "prompt": "A test sled starts from rest on a straight horizontal rail. Its acceleration is constant at 0.80 m s⁻² while it travels 3.6 m.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the speed of the sled after it has travelled 3.6 m. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the time taken to travel the 3.6 m. [2]",
          "marks": 2
        },
        {
          "label": "c",
          "text": "Explain why 3.6 m divided by the final speed would not give the time taken. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "2.4 m s⁻¹",
            "working": "v² = 0 + 2 × 0.80 × 3.6 = 5.76 m² s⁻²; v = √5.76 = 2.4 m s⁻¹.",
            "marking_points": [
              {
                "text": "Uses v² = u² + 2as with u = 0 and the stated acceleration and displacement.",
                "marks": 1
              },
              {
                "text": "Obtains 2.4 m s⁻¹.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "3.0 s",
            "working": "t = (v − u)/a = 2.4/0.80 = 3.0 s; equivalently t = √(2 × 3.6/0.80).",
            "marking_points": [
              {
                "text": "Uses t = (v − u)/a or t = √(2s/a).",
                "marks": 1
              },
              {
                "text": "Obtains 3.0 s; accept consistent follow-through from part (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "The sled accelerates from rest, so its average speed is below 2.4 m s⁻¹; distance divided by final speed underestimates the time.",
            "working": "The speed rises from 0 to 2.4 m s⁻¹, giving average speed 1.2 m s⁻¹ for constant acceleration. Using 2.4 m s⁻¹ as though it were constant gives 1.5 s instead of 3.0 s.",
            "marking_points": [
              {
                "text": "States that the sled starts from rest and speeds up, so final speed is not sustained.",
                "marks": 1
              },
              {
                "text": "Explains average speed is lower than final speed, so distance/final speed underestimates elapsed time.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        1
      ],
      "c": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-02-q04": {
    "context": {
      "number": 16,
      "prompt": "Two carts move along a straight horizontal track. A 0.60 kg cart travels to the right at 1.8 m s⁻¹ and strikes a stationary 0.30 kg cart. They attach on impact. The external horizontal impulse during the collision is negligible. Take right as positive.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the total momentum of the two carts before impact. [1]",
          "marks": 1
        },
        {
          "label": "b",
          "text": "Calculate the common velocity immediately after impact. [2]",
          "marks": 2
        },
        {
          "label": "c",
          "text": "Calculate the decrease in total kinetic energy in the collision and explain where that energy goes. [4]",
          "marks": 4
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "+1.08 kg m s⁻¹",
            "working": "p = 0.60 × 1.8 + 0.30 × 0 = +1.08 kg m s⁻¹.",
            "marking_points": [
              {
                "text": "Obtains +1.08 kg m s⁻¹ (or 1.1 kg m s⁻¹ to the right).",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "+1.2 m s⁻¹",
            "working": "(0.60 + 0.30)v = 1.08; v = 1.08/0.90 = +1.2 m s⁻¹.",
            "marking_points": [
              {
                "text": "Uses conservation of momentum with the combined mass 0.90 kg.",
                "marks": 1
              },
              {
                "text": "Obtains +1.2 m s⁻¹, or 1.2 m s⁻¹ to the right; accept consistent follow-through from part (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "0.324 J decrease; transferred mainly to deformation, internal energy and sound.",
            "working": "Before: ½(0.60)(1.8)² = 0.972 J. After: ½(0.60 + 0.30)(1.2)² = 0.648 J. Decrease = 0.324 J; attachment is inelastic and transforms kinetic energy to internal/deformation/sound stores.",
            "marking_points": [
              {
                "text": "Obtains initial total kinetic energy 0.972 J; the stationary cart initially has zero kinetic energy.",
                "marks": 1
              },
              {
                "text": "Obtains final total kinetic energy 0.648 J using the combined mass and common speed; follow-through from (b).",
                "marks": 1
              },
              {
                "text": "Obtains a decrease of 0.324 J from the two energies; follow-through accepted.",
                "marks": 1
              },
              {
                "text": "Explains transfer to deformation/internal energy or sound in the inelastic collision.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q16-carts.svg",
      "alt": "Two carts before impact: a 0.60 kg cart moving right at 1.8 m s⁻¹ towards a stationary 0.30 kg cart."
    },
    "answer_only_criteria": {
      "a": [
        0
      ],
      "b": [
        1
      ],
      "c": [
        2,
        3
      ]
    }
  },
  "neo-physics-foundations-02-q06": {
    "context": {
      "number": 18,
      "prompt": "A 0.075 kg foam ball is launched vertically from a cup. It rises 2.4 m above its launch point before stopping momentarily. Air resistance is negligible. Use g = 9.8 m s⁻².",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the increase in gravitational potential energy from launch to the highest point. [1]",
          "marks": 1
        },
        {
          "label": "b",
          "text": "Calculate the launch speed of the ball. [2]",
          "marks": 2
        },
        {
          "label": "c",
          "text": "Explain why the required launch speed would be unchanged for a ball of twice the mass reaching the same height under these assumptions. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "1.8 J",
            "working": "ΔEₚ = 0.075 × 9.8 × 2.4 = 1.764 J ≈ 1.8 J.",
            "marking_points": [
              {
                "text": "Obtains 1.8 J (accept 1.764 J or 1.76 J) using the stated data.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "6.9 m s⁻¹",
            "working": "½mu² = mgh; u = √(2 × 9.8 × 2.4) = 6.86 m s⁻¹ ≈ 6.9 m s⁻¹.",
            "marking_points": [
              {
                "text": "Equates initial kinetic energy to the potential-energy increase.",
                "marks": 1
              },
              {
                "text": "Obtains 6.9 m s⁻¹ (accept 6.86 m s⁻¹); accept consistent follow-through using part (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "Both energy terms are proportional to mass, so mass cancels from ½mu² = mgh; u = √(2gh).",
            "working": "At the highest point initial ½mu² has become mgh. Dividing both sides by m gives u² = 2gh, independent of ball mass.",
            "marking_points": [
              {
                "text": "Relates initial kinetic energy and gained potential energy through ½mu² = mgh.",
                "marks": 1
              },
              {
                "text": "Cancels mass to conclude u = √(2gh), unchanged for the same height.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        0
      ],
      "b": [
        1
      ],
      "c": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-02-q08": {
    "context": {
      "number": 20,
      "prompt": "Two heated surfaces R and S are modelled as black bodies. Their peak wavelengths are 1.20 μm and 0.80 μm respectively. The schematic spectra are normalized separately so that both peaks have the same plotted height. Use Wien’s constant b = 2.90 × 10⁻³ m K.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the temperature of surface R. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the ratio TS/TR and explain why the equal plotted peak heights do not imply equal temperatures. [3]",
          "marks": 3
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "2.42 × 10³ K",
            "working": "TR = b/λR = (2.90 × 10⁻³)/(1.20 × 10⁻⁶) = 2.4167 × 10³ K ≈ 2.42 × 10³ K.",
            "marking_points": [
              {
                "text": "Uses TR = b/λR with the peak wavelength in metres.",
                "marks": 1
              },
              {
                "text": "Obtains 2.42 × 10³ K (accept 2.4 × 10³ K).",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "TS/TR = 1.5. The curves were normalized separately, so equal plotted peak heights do not represent equal physical emission or equal temperature.",
            "working": "By Wien’s law TS/TR = λR/λS = 1.20/0.80 = 1.5. Separately rescaling spectra can make their plotted heights equal without changing the peak wavelengths used to infer temperature.",
            "marking_points": [
              {
                "text": "Uses inverse peak-wavelength relation TS/TR = λR/λS.",
                "marks": 1
              },
              {
                "text": "Obtains the dimensionless ratio 1.5.",
                "marks": 1
              },
              {
                "text": "Explains that separate normalization changes plotted heights; peak positions still show different temperatures.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q20-spectra.svg",
      "alt": "Separately normalized schematic black-body spectra: dashed curve S peaks at 0.80 μm and solid curve R peaks at 1.20 μm; both plotted peak heights are one."
    },
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        1,
        2
      ]
    }
  },
  "neo-physics-foundations-02-q10": {
    "context": {
      "number": 22,
      "prompt": "Monochromatic light passes normally through two narrow slits separated by 0.40 mm. A screen is 2.0 m from the slits. The centre of the first bright fringe and the centre of the sixth bright fringe on the same side of the central maximum are 15.0 mm apart. Use the small-angle approximation.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the separation of adjacent bright fringes. [1]",
          "marks": 1
        },
        {
          "label": "b",
          "text": "Calculate the wavelength of the light. [3]",
          "marks": 3
        }
      ],
      "answer": {
        "explanation": "Worked answers and marking points are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "3.0 mm",
            "working": "s = 15.0/(6 − 1) = 3.0 mm.",
            "marking_points": [
              {
                "text": "Divides 15.0 mm by five and obtains 3.0 mm.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "6.0 × 10⁻⁷ m",
            "working": "λ = sd/D = (3.0 × 10⁻³)(0.40 × 10⁻³)/2.0 = 6.0 × 10⁻⁷ m = 600 nm.",
            "marking_points": [
              {
                "text": "Uses λ = sd/D.",
                "marks": 1
              },
              {
                "text": "Uses compatible length units for the fringe and slit separations.",
                "marks": 1
              },
              {
                "text": "Obtains 6.0 × 10⁻⁷ m (or 600 nm); accept consistent follow-through from part (a).",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        0
      ],
      "b": [
        2
      ]
    }
  },
  "neo-physics-foundations-02-q12": {
    "context": {
      "number": 24,
      "prompt": "A stretched string supports a standing wave. A stroboscopic image shows successive nodes A, B and C with AB = BC = 0.18 m. The speed of travelling waves on the string is 54 m s⁻¹.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the wavelength of the travelling waves forming the standing wave. [1]",
          "marks": 1
        },
        {
          "label": "b",
          "text": "Calculate the frequency of the standing wave. [2]",
          "marks": 2
        },
        {
          "label": "c",
          "text": "Explain how the oscillations of points halfway between A and B and halfway between B and C compare in phase. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "0.36 m",
            "working": "λ = 2 × 0.18 = 0.36 m.",
            "marking_points": [
              {
                "text": "Obtains 0.36 m from twice the adjacent-node separation.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "150 Hz",
            "working": "f = 54/0.36 = 150 Hz.",
            "marking_points": [
              {
                "text": "Uses f = v/λ with the inferred wavelength.",
                "marks": 1
              },
              {
                "text": "Obtains 150 Hz; accept consistent follow-through from part (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "The two points oscillate in antiphase, differing by half a cycle, because they lie in adjacent standing-wave loops.",
            "working": "All non-node points in one loop move together. Across node B, neighbouring loops move in opposite directions at the same instant, a π rad phase difference.",
            "marking_points": [
              {
                "text": "Identifies points in adjacent loops separated by node B.",
                "marks": 1
              },
              {
                "text": "Concludes they oscillate in antiphase or π rad out of phase.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q24-nodes.svg",
      "alt": "A stroboscopic standing-wave pattern with successive nodes A, B and C; each adjacent-node distance is labelled 0.18 m."
    },
    "answer_only_criteria": {
      "a": [
        0
      ],
      "b": [
        1
      ],
      "c": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-03-q02": {
    "context": {
      "number": 26,
      "prompt": "A spherical satellite of radius 2.0 m is illuminated by approximately parallel solar radiation of intensity 800 W m⁻². A detector measures 3.52 × 10³ W of solar power scattered by the satellite. Treat the scattering as contributing to its overall albedo, and ignore other incoming radiation.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the albedo of the satellite. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the mean solar intensity absorbed per unit area of its whole surface. [3]",
          "marks": 3
        },
        {
          "label": "c",
          "text": "State one additional surface property needed to estimate its equilibrium temperature and explain why. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "0.350",
            "working": "Pincident = (800)π(2.0)² = 1.005 × 10⁴ W. Albedo = (3.52 × 10³)/Pincident = 0.350.",
            "marking_points": [
              {
                "text": "Uses incident power Sπr² for the projected disc.",
                "marks": 1
              },
              {
                "text": "Obtains albedo 0.350 (accept 0.35) from scattered/incident power.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "130 W m⁻²",
            "working": "Absorbed fraction = 1 − 0.35 = 0.65. Whole-sphere mean incident intensity = 800/4 = 200 W m⁻²; mean absorbed = 0.65 × 200 = 130 W m⁻².",
            "marking_points": [
              {
                "text": "Uses absorbed fraction 1 − albedo = 0.65.",
                "marks": 1
              },
              {
                "text": "Accounts for projected πr² versus total 4πr² area, giving mean incident intensity S/4.",
                "marks": 1
              },
              {
                "text": "Obtains mean absorbed intensity 130 W m⁻²; follow-through from (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "Emissivity is needed because it sets thermal power emitted at a given temperature; equilibrium requires emitted and absorbed powers to balance.",
            "working": "Thermal emission per unit area is εσT⁴. Without emissivity ε, the emitted power at each T cannot be calculated from the absorbed intensity alone.",
            "marking_points": [
              {
                "text": "Identifies surface emissivity as a needed property.",
                "marks": 1
              },
              {
                "text": "Explains that emissivity controls emitted thermal intensity in the equilibrium energy balance.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q26-sphere.svg",
      "alt": "Parallel rays illuminate a sphere of radius 2.0 m; the measured scattered solar power is 3.52 kW."
    },
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        2
      ],
      "c": [
        0,
        1
      ]
    }
  },
  "neo-physics-foundations-03-q04": {
    "context": {
      "number": 28,
      "prompt": "A rigid vessel of volume 0.100 m³ contains 2.00 × 10²² particles of an ideal gas at 300 K. Use kB = 1.38 × 10⁻²³ J K⁻¹. The vessel remains sealed.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the gas pressure at 300 K. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Explain, using the particle model, why heating the sealed rigid vessel increases its pressure. [3]",
          "marks": 3
        },
        {
          "label": "c",
          "text": "The gas warms to 450 K. Calculate its new pressure. [2]",
          "marks": 2
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "828 Pa",
            "working": "p = (2.00 × 10²²)(1.38 × 10⁻²³)(300)/0.100 = 828 Pa.",
            "marking_points": [
              {
                "text": "Uses p = NkBT/V with the stated particle count, constant and volume.",
                "marks": 1
              },
              {
                "text": "Obtains 828 Pa.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "Greater absolute temperature raises mean molecular kinetic energy. Molecules move faster, collide with the walls more often, and transfer more momentum in each collision, raising pressure.",
            "working": "At fixed N and V, heating increases mean translational kinetic energy and molecular speed. Wall collisions become more frequent and deliver greater impulse per collision, increasing mean force per area.",
            "marking_points": [
              {
                "text": "Relates higher absolute temperature to greater mean molecular kinetic energy or speed.",
                "marks": 1
              },
              {
                "text": "Explains faster particles produce more frequent wall collisions in the fixed vessel.",
                "marks": 1
              },
              {
                "text": "Explains faster particles transfer more momentum per collision, increasing the rate of momentum transfer to the walls and therefore pressure.",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "1.24 × 10³ Pa",
            "working": "p₂ = 828 × 450/300 = 1242 Pa ≈ 1.24 × 10³ Pa.",
            "marking_points": [
              {
                "text": "Uses p₂/p₁ = T₂/T₁ for fixed N and V.",
                "marks": 1
              },
              {
                "text": "Obtains 1242 Pa (accept 1.24 × 10³ Pa); consistent follow-through from (a).",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        0,
        1,
        2
      ],
      "c": [
        1
      ]
    }
  },
  "neo-physics-foundations-03-q06": {
    "context": {
      "number": 30,
      "prompt": "A rechargeable cell has emf 9.0 V and internal resistance 1.5 Ω. It supplies a steady current of 2.0 A to one external resistor.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the terminal potential difference of the cell. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the power delivered to the external resistor. [1]",
          "marks": 1
        },
        {
          "label": "c",
          "text": "Calculate the total power supplied by the cell and the power dissipated in its internal resistance. Explain the difference from (b). [3]",
          "marks": 3
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "6.0 V",
            "working": "Vterminal = 9.0 − (2.0)(1.5) = 6.0 V.",
            "marking_points": [
              {
                "text": "Uses Vterminal = ε − Ir.",
                "marks": 1
              },
              {
                "text": "Obtains 6.0 V.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "12 W",
            "working": "Pexternal = IVterminal = 2.0 × 6.0 = 12 W.",
            "marking_points": [
              {
                "text": "Obtains 12 W using current and terminal potential difference; follow-through from (a).",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "18 W total; 6.0 W dissipated internally as thermal energy, leaving 12 W externally.",
            "working": "Pcell = Iε = 2.0 × 9.0 = 18 W. Pinternal = I²r = (2.0)²(1.5) = 6.0 W. The internal thermal dissipation accounts for the difference 18 − 12 = 6 W.",
            "marking_points": [
              {
                "text": "Obtains total cell power Iε = 18 W.",
                "marks": 1
              },
              {
                "text": "Obtains internal dissipation I²r = 6.0 W.",
                "marks": 1
              },
              {
                "text": "Explains that internal heating accounts for the difference between total and external powers.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q30-cell.svg",
      "alt": "A cell with emf 9.0 V and internal resistance 1.5 ohms drives one external resistor at 2.0 A."
    },
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        0
      ],
      "c": [
        0,
        1,
        2
      ]
    }
  },
  "neo-physics-foundations-03-q08": {
    "context": {
      "number": 32,
      "prompt": "A 0.20 kg glider oscillates horizontally on a spring of spring constant 80 N m⁻¹. Friction is negligible. A second glider of mass 0.80 kg can be attached to the same spring instead.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the period of the 0.20 kg glider. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Determine the period and frequency of the 0.80 kg glider on the same spring. [3]",
          "marks": 3
        },
        {
          "label": "c",
          "text": "State whether doubling the oscillation amplitude changes its period in the ideal simple-harmonic model. [1]",
          "marks": 1
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "0.314 s",
            "working": "T = 2π√(0.20/80) = 0.314 s.",
            "marking_points": [
              {
                "text": "Uses T = 2π√(m/k) with the stated values.",
                "marks": 1
              },
              {
                "text": "Obtains 0.314 s (accept 0.31 s).",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "0.628 s and 1.59 Hz",
            "working": "T₂/T₁ = √(0.80/0.20) = 2. T₂ = 2(0.314) = 0.628 s; f₂ = 1/T₂ = 1.59 Hz.",
            "marking_points": [
              {
                "text": "Uses the square-root mass scaling T₂/T₁ = 2 (or a direct valid mass-spring calculation).",
                "marks": 1
              },
              {
                "text": "Obtains the new period 0.628 s; follow-through from (a).",
                "marks": 1
              },
              {
                "text": "Obtains frequency 1.59 Hz from the reciprocal period; follow-through accepted.",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "No, the period is unchanged.",
            "working": "T = 2π√(m/k), so the ideal model period is independent of amplitude.",
            "marking_points": [
              {
                "text": "States the period remains unchanged when amplitude doubles within the ideal SHM model.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q32-spring.svg",
      "alt": "Two gliders of masses 0.20 kg and 0.80 kg are considered separately on the same spring."
    },
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        1,
        2
      ],
      "c": [
        0
      ]
    }
  },
  "neo-physics-foundations-03-q10": {
    "context": {
      "number": 34,
      "prompt": "A small spherical body has mass 4.0 × 10²³ kg and radius 2.0 × 10⁶ m. Assume it can be treated as a point mass when finding the field outside it. Use G = 6.67 × 10⁻¹¹ N m² kg⁻². A 2.0 kg test mass is used in part (b).",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the gravitational field strength just above the surface. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the field strength at an altitude of 2.0 × 10⁶ m and the force on a 2.0 kg test mass there. [3]",
          "marks": 3
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "6.67 N kg⁻¹",
            "working": "g = (6.67 × 10⁻¹¹)(4.0 × 10²³)/(2.0 × 10⁶)² = 6.67 N kg⁻¹.",
            "marking_points": [
              {
                "text": "Uses g = GM/R² with the correct squared radius.",
                "marks": 1
              },
              {
                "text": "Obtains 6.67 N kg⁻¹ (accept 6.7 N kg⁻¹).",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "1.67 N kg⁻¹ and 3.34 N toward the body",
            "working": "r = 2.0 × 10⁶ + 2.0 × 10⁶ = 4.0 × 10⁶ m. g = 6.67/4 = 1.6675 N kg⁻¹. F = 2.0 × 1.6675 = 3.335 N toward the body.",
            "marking_points": [
              {
                "text": "Uses centre distance r = R + h = 4.0 × 10⁶ m.",
                "marks": 1
              },
              {
                "text": "Obtains field strength 1.67 N kg⁻¹ by inverse-square scaling or GM/r²; follow-through from (a).",
                "marks": 1
              },
              {
                "text": "Obtains gravitational force 3.34 N toward the body using F = mg; follow-through accepted.",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": null,
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        1,
        2
      ]
    }
  },
  "neo-physics-foundations-03-q12": {
    "context": {
      "number": 36,
      "prompt": "Two large parallel plates are 0.015 m apart. Their potential difference is 450 V, and the field between them is approximately uniform. A small particle of charge +2.0 μC is placed between the plates. Ignore edge effects.",
      "parts": [
        {
          "label": "a",
          "text": "Calculate the electric field strength between the plates. [2]",
          "marks": 2
        },
        {
          "label": "b",
          "text": "Calculate the force magnitude and explain its direction using the sign of the particle’s charge. [3]",
          "marks": 3
        },
        {
          "label": "c",
          "text": "The plate separation is doubled while their potential difference stays 450 V. State how the force magnitude changes. [1]",
          "marks": 1
        }
      ],
      "answer": {
        "explanation": "Worked answers and one-mark criteria are given for each part.",
        "parts": [
          {
            "label": "a",
            "answer": "3.0 × 10⁴ V m⁻¹",
            "working": "E = 450/0.015 = 3.0 × 10⁴ V m⁻¹.",
            "marking_points": [
              {
                "text": "Uses E = V/d with d = 0.015 m.",
                "marks": 1
              },
              {
                "text": "Obtains 3.0 × 10⁴ V m⁻¹.",
                "marks": 1
              }
            ]
          },
          {
            "label": "b",
            "answer": "0.060 N toward the negative plate",
            "working": "F = (2.0 × 10⁻⁶)(3.0 × 10⁴) = 0.060 N. Electric field direction is from positive to negative plate; a positive charge experiences force along that direction.",
            "marking_points": [
              {
                "text": "Uses F = qE with q = 2.0 × 10⁻⁶ C.",
                "marks": 1
              },
              {
                "text": "Obtains force magnitude 0.060 N; follow-through from (a).",
                "marks": 1
              },
              {
                "text": "Explains that a positive charge feels force with the field, toward the negative plate.",
                "marks": 1
              }
            ]
          },
          {
            "label": "c",
            "answer": "It halves to 0.030 N.",
            "working": "Doubling d halves E, so F = qE also halves.",
            "marking_points": [
              {
                "text": "States that the force magnitude halves (to 0.030 N).",
                "marks": 1
              }
            ]
          }
        ]
      }
    },
    "diagram": {
      "file": "assets/q36-plates.svg",
      "alt": "Parallel positive and negative plates separated by 0.015 m with a positive test particle between them."
    },
    "answer_only_criteria": {
      "a": [
        1
      ],
      "b": [
        1
      ],
      "c": [
        0
      ]
    }
  }
};
