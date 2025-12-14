import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";


const userSchema = new mongoose.Schema(
  {
    uuid: { type: String, default: uuidv4, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Operator"],
      default: "Operator",
    },
    mobile: { type: String  },
    department: { type: String  },
    designation: { type: String  },
    address: { type: String  },
    state: { type: String  },
    country: { type: String  },
    profilePic: { type: String  },
    DOB: { type: Date  },
    gender: { type: String  },
    emergencyContact: { type: String  },
    joinedDate: { type: Date  },
    employmentType: { type: String  },
    shiftTiming: { type: String  },

  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
